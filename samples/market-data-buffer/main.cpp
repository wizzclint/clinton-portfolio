// New portfolio lab: synthetic normalized quotes, not live exchange ingestion.
// C++17, standard library only. No latency guarantee is made by this sample.
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <thread>

using Clock = std::chrono::steady_clock;

struct Quote {
    std::uint32_t venue = 0;
    std::uint64_t sequence = 0;
    std::int64_t bid_ticks = 0;
    std::int64_t ask_ticks = 0;
    Clock::time_point produced_at{};
};

// Each queue has exactly one producer and one consumer. Capacity includes one
// sentinel slot. Acquire/release publishes each slot before it is read/reused.
template<std::size_t Capacity>
class SpscQueue {
    static_assert(Capacity > 1, "Queue needs at least two slots");
    std::array<Quote, Capacity> slots_{};
    alignas(64) std::atomic<std::size_t> head_{0};
    alignas(64) std::atomic<std::size_t> tail_{0};
public:
    bool push(const Quote& quote) {
        const auto head = head_.load(std::memory_order_relaxed);
        const auto next = (head + 1) % Capacity;
        if (next == tail_.load(std::memory_order_acquire)) return false;
        slots_[head] = quote;
        head_.store(next, std::memory_order_release);
        return true;
    }
    bool pop(Quote& quote) {
        const auto tail = tail_.load(std::memory_order_relaxed);
        if (tail == head_.load(std::memory_order_acquire)) return false;
        quote = slots_[tail];
        tail_.store((tail + 1) % Capacity, std::memory_order_release);
        return true;
    }
};

void require(bool condition, const char* message) {
    if (!condition) throw std::runtime_error(message);
}

void test_queue() {
    SpscQueue<4> queue;
    Quote out;
    require(!queue.pop(out), "Empty queue must not pop");
    for (std::uint64_t round = 0; round < 100; ++round) {
        for (std::uint64_t i = 0; i < 3; ++i) {
            Quote in;
            in.sequence = round * 3 + i;
            require(queue.push(in), "Queue must accept available slots");
        }
        require(!queue.push(Quote{}), "Full queue must reject writes");
        for (std::uint64_t i = 0; i < 3; ++i) {
            require(queue.pop(out), "Queued quote must be readable");
            require(out.sequence == round * 3 + i, "FIFO order must survive wrapping");
        }
        require(!queue.pop(out), "Drained queue must be empty");
    }
}

int main() {
    try {
        test_queue();
        constexpr std::uint64_t per_venue = 50000;
        std::array<SpscQueue<256>, 2> queues;
        auto produce = [&](std::uint32_t venue) {
            for (std::uint64_t sequence = 1; sequence <= per_venue; ++sequence) {
                Quote q{venue, sequence, 6000000 + static_cast<std::int64_t>(sequence % 100),
                        6000002 + static_cast<std::int64_t>(sequence % 100), Clock::now()};
                // Backpressure: retry without dropping or overwriting a quote.
                while (!queues[venue].push(q)) std::this_thread::yield();
            }
        };
        const auto started = Clock::now();
        std::thread first(produce, 0);
        std::thread second(produce, 1);
        std::array<std::uint64_t, 2> received{};
        std::uint64_t consumed = 0;
        std::uint64_t invalid = 0;
        std::int64_t maximum_ns = 0;
        while (consumed < 2 * per_venue) {
            bool progress = false;
            for (std::uint32_t venue = 0; venue < 2; ++venue) {
                Quote q;
                if (!queues[venue].pop(q)) continue;
                progress = true;
                ++consumed;
                if (q.venue != venue || q.sequence != ++received[venue] ||
                    q.bid_ticks <= 0 || q.ask_ticks < q.bid_ticks) ++invalid;
                const auto age = std::chrono::duration_cast<std::chrono::nanoseconds>(Clock::now() - q.produced_at).count();
                if (age > maximum_ns) maximum_ns = age;
            }
            if (!progress) std::this_thread::yield();
        }
        first.join();
        second.join();
        require(invalid == 0, "Quote integrity or per-venue sequence failed");
        require(received[0] == per_venue && received[1] == per_venue, "Quotes were lost");
        const auto elapsed = std::chrono::duration_cast<std::chrono::microseconds>(Clock::now() - started).count();
        std::cout << "PASS: queue boundaries, wraparound, 100000 quotes, two producers, per-venue order\n"
                  << "Run time (us): " << elapsed << '\n'
                  << "Maximum observed generation-to-consumption age (ns): " << maximum_ns << '\n'
                  << "Synthetic local run only; includes queue backpressure and OS scheduling.\n";
    } catch (const std::exception& error) {
        std::cerr << "FAIL: " << error.what() << '\n';
        return 1;
    }
}
