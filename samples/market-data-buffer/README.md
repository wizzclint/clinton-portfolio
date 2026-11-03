# Market Data Buffer Lab

A new C++17 portfolio sample. Two synthetic producers each own a bounded SPSC
queue; one consumer validates fixed-point bid/ask quotes and per-venue sequences.
Queue boundary/wraparound checks and a 100,000-quote threaded integrity run are
included in the executable. Uses standard C++ only, with acquire/release atomics
and explicit retry backpressure. It never contacts an exchange or places trades.

## Build and run

GCC or Clang, Linux/macOS:

```sh
c++ -std=c++17 -O2 -Wall -Wextra -Wpedantic -pthread main.cpp -o market-data-buffer
./market-data-buffer
```

MSVC developer prompt:

```bat
cl /std:c++17 /O2 /EHsc /W4 main.cpp /Fe:market-data-buffer.exe
market-data-buffer.exe
```

## Scope and verification

This is a new source sample, not past client work. A C++ toolchain was not
available on the editing PC, so compilation and runtime checks still need to
be performed with the commands above. No measured performance is claimed.

Synthetic quotes arrive already normalized. Live Binance/Bybit WebSockets,
exchange JSON parsing, reconnects, resubscription, stale-data handling and TLS
are outside the scope. Generation-to-consumption age includes queue waiting
and OS scheduling; it is not network latency or an under-0.5 ms guarantee.
These production requirements need implementation and benchmarking on the
target hardware before this can support the advertised contract deliverable.
