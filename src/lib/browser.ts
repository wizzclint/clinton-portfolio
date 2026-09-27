// Fallbacks for browser APIs that only exist on secure pages (HTTPS or
// localhost). Opening the dev server over a LAN address like
// http://192.168.x.x is an insecure context, where crypto.subtle,
// crypto.randomUUID and navigator.clipboard are all undefined.

/** Copy text, falling back to a hidden textarea when the Clipboard API is unavailable. */
export function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  } else {
    legacyCopy(text);
  }
}

function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
}

/** RFC 4122 v4 UUID. getRandomValues works in insecure contexts; randomUUID does not. */
export function uuidv4() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

/** Merkle–Damgård padding shared by SHA-1 and SHA-256. */
function pad(msg: Uint8Array) {
  const len = msg.length;
  const out = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  out.set(msg);
  out[len] = 0x80;
  const view = new DataView(out.buffer);
  view.setUint32(out.length - 8, Math.floor((len * 8) / 2 ** 32));
  view.setUint32(out.length - 4, (len * 8) >>> 0);
  return view;
}

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
const rotl = (x: number, n: number) => (x << n) | (x >>> (32 - n));
const words = (h: number[]) => h.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");

export function sha1Hex(msg: Uint8Array) {
  const view = pad(msg);
  const h = [0x67452301, 0xefcdab89 | 0, 0x98badcfe | 0, 0x10325476, 0xc3d2e1f0 | 0];
  const w = new Int32Array(80);
  for (let off = 0; off < view.byteLength; off += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getInt32(off + t * 4);
    for (let t = 16; t < 80; t++) w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    let [a, b, c, d, e] = h;
    for (let t = 0; t < 80; t++) {
      const [f, k] =
        t < 20
          ? [(b & c) | (~b & d), 0x5a827999]
          : t < 40
            ? [b ^ c ^ d, 0x6ed9eba1]
            : t < 60
              ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc | 0]
              : [b ^ c ^ d, 0xca62c1d6 | 0];
      const tmp = (rotl(a, 5) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = tmp;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
  }
  return words(h);
}

// SHA-256 round constants: fractional parts of the square / cube roots of the first primes
const H256: number[] = [];
const K256: number[] = [];
for (let c = 2; K256.length < 64; c++) {
  let prime = true;
  for (let d = 2; d * d <= c; d++) if (c % d === 0) prime = false;
  if (!prime) continue;
  if (H256.length < 8) H256.push(((Math.sqrt(c) % 1) * 2 ** 32) | 0);
  K256.push(((Math.cbrt(c) % 1) * 2 ** 32) | 0);
}

export function sha256Hex(msg: Uint8Array) {
  const view = pad(msg);
  const h = [...H256];
  const w = new Int32Array(64);
  for (let off = 0; off < view.byteLength; off += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getInt32(off + t * 4);
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15];
      const y = w[t - 2];
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K256[t] + w[t]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }
  return words(h);
}

/**
 * Hex digest via WebCrypto, or the pure-JS fallbacks on insecure pages.
 * Returns null for algorithms with no fallback (SHA-384 / SHA-512).
 */
export async function digestHex(algo: string, text: string): Promise<string | null> {
  const bytes = new TextEncoder().encode(text);
  if (crypto.subtle) return toHex(new Uint8Array(await crypto.subtle.digest(algo, bytes)));
  if (algo === "SHA-1") return sha1Hex(bytes);
  if (algo === "SHA-256") return sha256Hex(bytes);
  return null;
}
