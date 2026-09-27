"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { copyText, digestHex, uuidv4 } from "@/lib/browser";

/* ─────────────── shared helpers ─────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <span className="field-label">
        {label} {hint && <em>· {hint}</em>}
      </span>
      {children}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn-sm"
      disabled={!text}
      onClick={() => {
        copyText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function fmtDuration(sec: number) {
  if (!isFinite(sec)) return "forever";
  if (sec < 1) return "instant";
  const units: [number, string][] = [
    [31536000 * 1e9, "billion yrs"],
    [31536000 * 1e6, "million yrs"],
    [31536000 * 1000, "thousand yrs"],
    [31536000, "years"],
    [2592000, "months"],
    [86400, "days"],
    [3600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  for (const [s, name] of units) if (sec >= s) return `${Math.round(sec / s).toLocaleString()} ${name}`;
  return "instant";
}

/* ─────────────── Password Analyzer ─────────────── */

const COMMON = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "dragon", "iloveyou", "abc123", "football", "master", "login", "princess", "sunshine"];

function analyzePassword(pw: string) {
  const findings: { ok?: boolean; text: string }[] = [];
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  let bits = pw.length ? pw.length * Math.log2(Math.max(pool, 1)) : 0;

  const lower = pw.toLowerCase();
  const common = COMMON.find((w) => lower.includes(w));
  if (common) {
    bits = Math.min(bits, 10 + (pw.length - common.length) * 3);
    findings.push({ text: `Contains a top-leaked password fragment (“${common}”)` });
  }
  if (/(.)\1{2,}/.test(pw)) {
    bits -= 8;
    findings.push({ text: "Repeated characters (e.g. “aaa”) reduce entropy" });
  }
  if (/(?:abc|bcd|cde|def|123|234|345|456|567|678|789|qwe|wer|asd|zxc)/i.test(pw)) {
    bits -= 8;
    findings.push({ text: "Keyboard or alphabetic sequence detected" });
  }
  if (/(19|20)\d{2}/.test(pw)) {
    bits -= 6;
    findings.push({ text: "Looks like it contains a year" });
  }
  if (pw.length && pw.length < 12) findings.push({ text: "Shorter than 12 characters" });
  if (pw.length >= 16) findings.push({ ok: true, text: "Good length (16+)" });
  if (pool >= 90) findings.push({ ok: true, text: "Uses all four character classes" });
  bits = Math.max(0, bits);
  const score = Math.min(100, Math.round((bits / 100) * 100));
  return { pool, bits, score, findings };
}

const ATTACKERS = [
  { name: "Online, throttled", hw: "Rate-limited login", rate: 10 },
  { name: "Online, unthrottled", hw: "Botnet vs login", rate: 1e4 },
  { name: "Offline, slow hash", hw: "bcrypt · 1 GPU", rate: 1e5 },
  { name: "Offline, fast hash", hw: "MD5 · 1 GPU", rate: 1e10 },
  { name: "Offline, cluster", hw: "SHA-1 · GPU farm", rate: 1e12 },
];

function PasswordAnalyzer() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const r = useMemo(() => analyzePassword(pw), [pw]);
  const color = r.score < 35 ? "var(--danger)" : r.score < 65 ? "var(--warn)" : "var(--accent)";
  return (
    <>
      <Field label="Password / passphrase" hint="never transmitted">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input
            className="input"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Type something to test…"
            autoComplete="off"
          />
          <button className="btn btn-sm" onClick={() => setShow((s) => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </Field>
      <div className="meter">
        <i style={{ width: `${pw ? Math.max(4, r.score) : 0}%`, background: color }} />
      </div>
      <div className="metrics">
        <div className="metric"><b>{pw.length}</b><span>Length</span></div>
        <div className="metric"><b>{r.pool}</b><span>Charset</span></div>
        <div className="metric"><b>{r.bits.toFixed(1)}</b><span>Entropy bits</span></div>
        <div className="metric"><b style={{ color }}>{pw ? r.score : "-"}</b><span>Score</span></div>
      </div>
      <Field label="Offline crack time by attacker class">
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>Attacker</th><th>Hardware</th><th>Guesses/sec</th><th>Time to break</th></tr>
            </thead>
            <tbody>
              {ATTACKERS.map((a) => (
                <tr key={a.name}>
                  <td>{a.name}</td>
                  <td>{a.hw}</td>
                  <td>{a.rate.toExponential(0)}</td>
                  <td>{pw ? fmtDuration(Math.pow(2, r.bits) / 2 / a.rate) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Field>
      <Field label="Findings">
        <ul className="findings">
          {!pw && <li className="ok">Waiting for input</li>}
          {r.findings.map((f, i) => (
            <li key={i} className={f.ok ? "ok" : ""}>{f.text}</li>
          ))}
        </ul>
      </Field>
    </>
  );
}

/* ─────────────── Hash Forge ─────────────── */

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

const NO_FALLBACK = "Needs a secure (HTTPS) page in this browser";

function HashForge() {
  const [text, setText] = useState("hello world");
  const [compare, setCompare] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    Promise.all(ALGOS.map((a) => digestHex(a, text))).then((res) => {
      if (live) setHashes(Object.fromEntries(ALGOS.map((a, i) => [a, res[i] ?? NO_FALLBACK])));
    });
    return () => {
      live = false;
    };
  }, [text]);
  const match = compare.trim().toLowerCase();
  return (
    <>
      <Field label="Input" hint="hashed with WebCrypto, locally">
        <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      {ALGOS.map((a) => (
        <Field key={a} label={a}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <div className="output" style={{ flex: 1, borderColor: match && hashes[a] === match ? "var(--accent)" : undefined }}>
              {hashes[a] ?? "…"}
            </div>
            <CopyBtn text={hashes[a] && hashes[a] !== NO_FALLBACK ? hashes[a] : ""} />
          </div>
        </Field>
      ))}
      <Field label="Verify" hint="paste a hash to compare">
        <input className="input" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="e.g. b94d27b9…" />
        {match && (
          <p className="mono" style={{ fontSize: 12.5, marginTop: 8 }}>
            {Object.entries(hashes).find(([, h]) => h === match) ? (
              <span className="badge-pass">✓ matches {Object.entries(hashes).find(([, h]) => h === match)![0]}</span>
            ) : (
              <span className="badge-fail">✗ no match</span>
            )}
          </p>
        )}
      </Field>
    </>
  );
}

/* ─────────────── JWT Dissector ─────────────── */

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ";

function b64urlDecode(s: string) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(pad);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function JwtDissector() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const parsed = useMemo(() => {
    try {
      const [h, p, s] = token.trim().split(".");
      if (!h || !p) throw new Error("A JWT has three dot-separated parts");
      const header = JSON.parse(b64urlDecode(h));
      const payload = JSON.parse(b64urlDecode(p));
      return { header, payload, sig: s ?? "", error: "" };
    } catch (e) {
      return { header: null, payload: null, sig: "", error: (e as Error).message };
    }
  }, [token]);

  const notes: { ok?: boolean; text: string }[] = [];
  if (parsed.header) {
    const alg = String(parsed.header.alg ?? "");
    if (alg.toLowerCase() === "none") notes.push({ text: "alg: none — signature is not verified. Critical." });
    else if (alg.startsWith("HS")) notes.push({ text: `${alg} uses a shared secret — make sure it is long and random` });
    else notes.push({ ok: true, text: `${alg} is an asymmetric algorithm` });
    const exp = parsed.payload?.exp;
    if (typeof exp === "number") {
      const d = new Date(exp * 1000);
      notes.push(d < new Date() ? { text: `Expired ${d.toLocaleString()}` } : { ok: true, text: `Valid until ${d.toLocaleString()}` });
    } else notes.push({ text: "No exp claim — token never expires" });
    if (parsed.payload?.role || parsed.payload?.admin) notes.push({ text: "Carries authorisation claims — verify server-side" });
  }

  return (
    <>
      <Field label="Token" hint="decoded locally, not verified">
        <textarea className="textarea" value={token} onChange={(e) => setToken(e.target.value)} />
      </Field>
      {parsed.error ? (
        <div className="output badge-fail">{parsed.error}</div>
      ) : (
        <>
          <div className="grid-2">
            <Field label="Header">
              <div className="output">{JSON.stringify(parsed.header, null, 2)}</div>
            </Field>
            <Field label="Payload">
              <div className="output">{JSON.stringify(parsed.payload, null, 2)}</div>
            </Field>
          </div>
          <Field label="Signature">
            <div className="output">{parsed.sig || "(empty)"}</div>
          </Field>
          <Field label="Findings">
            <ul className="findings">
              {notes.map((n, i) => (
                <li key={i} className={n.ok ? "ok" : ""}>{n.text}</li>
              ))}
            </ul>
          </Field>
        </>
      )}
    </>
  );
}

/* ─────────────── Subnet Calculator ─────────────── */

function ipToInt(ip: string) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255 || !Number.isInteger(n))) return null;
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}
const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

function SubnetCalc() {
  const [cidr, setCidr] = useState("192.168.10.34/26");
  const r = useMemo(() => {
    const [ip, bitsStr] = cidr.trim().split("/");
    const bits = Number(bitsStr);
    const n = ipToInt(ip ?? "");
    if (n === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const net = (n & mask) >>> 0;
    const bcast = (net | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - bits);
    const usable = bits >= 31 ? total : total - 2;
    return [
      ["Network", intToIp(net)],
      ["Broadcast", intToIp(bcast)],
      ["Netmask", intToIp(mask)],
      ["Wildcard", intToIp(~mask >>> 0)],
      ["First host", intToIp(bits >= 31 ? net : net + 1)],
      ["Last host", intToIp(bits >= 31 ? bcast : bcast - 1)],
      ["Usable hosts", usable.toLocaleString()],
      ["Private (RFC1918)", /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip) ? "yes" : "no"],
    ];
  }, [cidr]);
  return (
    <>
      <Field label="IPv4 CIDR">
        <input className="input" value={cidr} onChange={(e) => setCidr(e.target.value)} />
      </Field>
      {r ? (
        <table className="table">
          <tbody>
            {r.map(([k, v]) => (
              <tr key={k}><th style={{ width: "40%" }}>{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="output badge-fail">Enter something like 10.0.0.0/8</div>
      )}
    </>
  );
}

/* ─────────────── Encoder Multi-tool ─────────────── */

const ENCODERS: Record<string, { enc: (s: string) => string; dec: (s: string) => string }> = {
  Base64: {
    enc: (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))),
    dec: (s) => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0))),
  },
  URL: { enc: encodeURIComponent, dec: decodeURIComponent },
  Hex: {
    enc: (s) => [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, "0")).join(" "),
    dec: (s) => new TextDecoder().decode(Uint8Array.from((s.replace(/[^0-9a-f]/gi, "").match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)))),
  },
  "HTML entities": {
    enc: (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`),
    dec: (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d))).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
  },
  ROT13: {
    enc: (s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.toLowerCase().charCodeAt(0) - 97 + 13) % 26) + (c < "a" ? 65 : 97))),
    dec: (s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.toLowerCase().charCodeAt(0) - 97 + 13) % 26) + (c < "a" ? 65 : 97))),
  },
};

function Encoder() {
  const [mode, setMode] = useState("Base64");
  const [dir, setDir] = useState<"enc" | "dec">("enc");
  const [input, setInput] = useState("<script>alert('hi')</script>");
  let out = "";
  let err = "";
  try {
    out = ENCODERS[mode][dir](input);
  } catch {
    err = "Input is not valid for this decoder";
  }
  return (
    <>
      <div className="row">
        {Object.keys(ENCODERS).map((m) => (
          <button key={m} className={`btn btn-sm ${m === mode ? "btn-primary" : ""}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="row">
        <button className={`btn btn-sm ${dir === "enc" ? "btn-primary" : ""}`} onClick={() => setDir("enc")}>Encode</button>
        <button className={`btn btn-sm ${dir === "dec" ? "btn-primary" : ""}`} onClick={() => setDir("dec")}>Decode</button>
        <button className="btn btn-sm" onClick={() => { setInput(out); setDir(dir === "enc" ? "dec" : "enc"); }} disabled={!!err}>
          ⇅ Swap
        </button>
      </div>
      <Field label="Input">
        <textarea className="textarea" value={input} onChange={(e) => setInput(e.target.value)} />
      </Field>
      <Field label="Output">
        <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
          <div className={`output ${err ? "badge-fail" : ""}`} style={{ flex: 1 }}>{err || out}</div>
          <CopyBtn text={err ? "" : out} />
        </div>
      </Field>
    </>
  );
}

/* ─────────────── Regex Workbench ─────────────── */

function RegexBench() {
  const [pattern, setPattern] = useState("\\b[\\w.+-]+@[\\w-]+\\.[\\w.]+\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Contact alice@example.com or bob.smith+test@mail.co.uk.\nNot an email: foo@bar");
  const res = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const matches = [...text.matchAll(re)].filter((m) => m[0] !== "");
      const parts: ReactNode[] = [];
      let last = 0;
      matches.forEach((m, i) => {
        parts.push(text.slice(last, m.index));
        parts.push(<mark key={i}>{m[0]}</mark>);
        last = (m.index ?? 0) + m[0].length;
      });
      parts.push(text.slice(last));
      return { matches, parts, error: "" };
    } catch (e) {
      return { matches: [], parts: [text], error: (e as Error).message };
    }
  }, [pattern, flags, text]);
  return (
    <>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <div style={{ flex: 1 }}>
          <Field label="Pattern">
            <input className="input" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          </Field>
        </div>
        <div style={{ width: 90 }}>
          <Field label="Flags">
            <input className="input" value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} />
          </Field>
        </div>
      </div>
      <Field label="Test string">
        <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <Field label={res.error ? "Error" : `${res.matches.length} match${res.matches.length === 1 ? "" : "es"}`}>
        <div className={`output ${res.error ? "badge-fail" : ""}`} style={{ wordBreak: "break-word" }}>
          {res.error || res.parts}
        </div>
      </Field>
      {res.matches.some((m) => m.length > 1) && (
        <table className="table">
          <thead><tr><th>#</th><th>Match</th><th>Groups</th></tr></thead>
          <tbody>
            {res.matches.map((m, i) => (
              <tr key={i}><td>{i + 1}</td><td>{m[0]}</td><td>{m.slice(1).join(" | ")}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/* ─────────────── JSON Toolkit ─────────────── */

function jsonStats(v: unknown, depth = 0): { keys: number; depth: number } {
  if (v && typeof v === "object") {
    const vals = Object.values(v as object);
    const kids = vals.map((x) => jsonStats(x, depth + 1));
    return {
      keys: (Array.isArray(v) ? 0 : vals.length) + kids.reduce((a, k) => a + k.keys, 0),
      depth: Math.max(depth + 1, ...kids.map((k) => k.depth)),
    };
  }
  return { keys: 0, depth };
}

function JsonToolkit() {
  const [input, setInput] = useState('{"user":{"id":7,"roles":["admin","dev"],"active":true},"tags":["a","b"]}');
  const [indent, setIndent] = useState(2);
  let parsed: unknown;
  let error = "";
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    error = (e as Error).message;
  }
  const stats = error ? null : jsonStats(parsed);
  const pretty = error ? "" : JSON.stringify(parsed, null, indent);
  return (
    <>
      <Field label="JSON input">
        <textarea className="textarea" value={input} onChange={(e) => setInput(e.target.value)} />
      </Field>
      <div className="row">
        <button className="btn btn-sm" disabled={!!error} onClick={() => setInput(JSON.stringify(parsed, null, indent))}>Format</button>
        <button className="btn btn-sm" disabled={!!error} onClick={() => setInput(JSON.stringify(parsed))}>Minify</button>
        <select className="select" style={{ width: "auto", padding: "7px 10px" }} value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
        <span className={`mono ${error ? "badge-fail" : "badge-pass"}`} style={{ fontSize: 12.5 }}>
          {error ? `✗ ${error}` : `✓ valid · ${stats!.keys} keys · depth ${stats!.depth} · ${new Blob([input]).size} bytes`}
        </span>
      </div>
      {!error && (
        <Field label="Pretty">
          <div className="output" style={{ maxHeight: 260, overflow: "auto", wordBreak: "normal" }}>{pretty}</div>
        </Field>
      )}
    </>
  );
}

/* ─────────────── Generator Suite ─────────────── */

function randInt(max: number) {
  const a = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  do crypto.getRandomValues(a);
  while (a[0] >= limit);
  return a[0] % max;
}

function Generators() {
  const [len, setLen] = useState(20);
  const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [seed, setSeed] = useState(0);
  const [values, setValues] = useState({ pw: "", uuid: "", hex: "" });

  useEffect(() => {
    const chars =
      (sets.lower ? "abcdefghijkmnopqrstuvwxyz" : "") +
      (sets.upper ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "") +
      (sets.digits ? "23456789" : "") +
      (sets.symbols ? "!@#$%^&*-_=+?" : "");
    const pw = chars ? Array.from({ length: len }, () => chars[randInt(chars.length)]).join("") : "";
    const hex = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const t = setTimeout(() => setValues({ pw, uuid: uuidv4(), hex }), 0);
    return () => clearTimeout(t);
  }, [len, sets, seed]);

  return (
    <>
      <Field label={`Password length · ${len}`}>
        <input type="range" min={8} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
      </Field>
      <div className="row">
        {(Object.keys(sets) as (keyof typeof sets)[]).map((k) => (
          <label key={k} className="chip" style={{ gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={sets[k]} onChange={() => setSets((s) => ({ ...s, [k]: !s[k] }))} style={{ accentColor: "var(--accent)" }} />
            {k}
          </label>
        ))}
        <button className="btn btn-sm btn-primary" onClick={() => setSeed((s) => s + 1)}>↻ Regenerate</button>
      </div>
      {([["Password", values.pw], ["UUID v4", values.uuid], ["256-bit token (hex)", values.hex]] as const).map(([label, v]) => (
        <Field key={label} label={label} hint="crypto.getRandomValues">
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <div className="output" style={{ flex: 1 }}>{v}</div>
            <CopyBtn text={v} />
          </div>
        </Field>
      ))}
    </>
  );
}

/* ─────────────── Contrast Checker ─────────────── */

function lum(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function Contrast() {
  const [fg, setFg] = useState("#0b8a5a");
  const [bg, setBg] = useState("#ffffff");
  const lf = lum(fg);
  const lb = lum(bg);
  const ratio = lf !== null && lb !== null ? (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05) : null;
  const checks = [
    ["AA normal text", 4.5],
    ["AA large text", 3],
    ["AAA normal text", 7],
    ["AAA large text", 4.5],
  ] as const;
  return (
    <>
      <div className="grid-2">
        {([["Foreground", fg, setFg], ["Background", bg, setBg]] as const).map(([label, v, set]) => (
          <Field key={label} label={label}>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input type="color" value={lum(v) !== null && v.length === 7 ? v : "#000000"} onChange={(e) => set(e.target.value)} style={{ width: 44, height: 42, border: 0, background: "none" }} />
              <input className="input" value={v} onChange={(e) => set(e.target.value)} />
            </div>
          </Field>
        ))}
      </div>
      <div className="swatch" style={{ color: fg, background: bg }}>
        The quick brown fox jumps over the lazy dog.
        <div style={{ fontSize: 13, marginTop: 6 }}>Small body text preview at 13px.</div>
      </div>
      <div className="metrics">
        {checks.map(([label, min]) => (
          <div className="metric" key={label}>
            <b className={ratio && ratio >= min ? "badge-pass" : "badge-fail"}>{ratio && ratio >= min ? "Pass" : "Fail"}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="mono" style={{ fontSize: 13 }}>
        Contrast ratio: <b>{ratio ? ratio.toFixed(2) : "-"}:1</b>
      </p>
    </>
  );
}

/* ─────────────── Palette Generator ─────────────── */

function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const LIGHTNESS = [97, 93, 85, 74, 62, 50, 42, 34, 25, 16];

function PaletteGen() {
  const [base, setBase] = useState("#0b8a5a");
  const [harmony, setHarmony] = useState<"scale" | "complementary" | "triadic" | "analogous">("scale");
  const valid = /^#[0-9a-f]{6}$/i.test(base);
  const [h, s] = valid ? hexToHsl(base) : [0, 0];
  const scale = STEPS.map((step, i) => [step, hslToHex(h, Math.max(s, 20), LIGHTNESS[i])] as const);
  const offsets = { scale: [], complementary: [180], triadic: [120, 240], analogous: [-30, 30] }[harmony];
  const harmonies = [0, ...offsets].map((o) => hslToHex((h + o + 360) % 360, s, 50));
  const css = scale.map(([step, hex]) => `  --brand-${step}: ${hex};`).join("\n");

  return (
    <>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="color" value={valid ? base : "#000000"} onChange={(e) => setBase(e.target.value)} style={{ width: 44, height: 42, border: 0, background: "none" }} />
        <input className="input" value={base} onChange={(e) => setBase(e.target.value)} />
      </div>
      <div className="row">
        {(["scale", "complementary", "triadic", "analogous"] as const).map((m) => (
          <button key={m} className={`btn btn-sm ${harmony === m ? "btn-primary" : ""}`} onClick={() => setHarmony(m)}>
            {m}
          </button>
        ))}
      </div>
      {!valid ? (
        <div className="output badge-fail">Enter a 6-digit hex colour like #0b8a5a</div>
      ) : (
        <>
          <Field label="Tint & shade scale" hint="click a swatch to copy">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", borderRadius: 8, overflow: "hidden" }}>
              {scale.map(([step, hex], i) => (
                <button
                  key={step}
                  onClick={() => copyText(hex)}
                  title={hex}
                  style={{ background: hex, height: 64, color: i < 5 ? "#111" : "#fff", fontSize: 10, fontFamily: "var(--font-mono)" }}
                >
                  {step}
                </button>
              ))}
            </div>
          </Field>
          {harmony !== "scale" && (
            <Field label={`${harmony} harmony`}>
              <div className="row">
                {harmonies.map((hex) => (
                  <button key={hex} onClick={() => copyText(hex)} className="chip" style={{ gap: 8, height: 34 }}>
                    <i style={{ width: 16, height: 16, borderRadius: 4, background: hex }} />
                    {hex}
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="CSS variables">
            <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
              <div className="output" style={{ flex: 1 }}>{`:root {\n${css}\n}`}</div>
              <CopyBtn text={`:root {\n${css}\n}`} />
            </div>
          </Field>
        </>
      )}
    </>
  );
}

/* ─────────────── CSV Profiler ─────────────── */

const SAMPLE_CSV = `region,month,orders,revenue,rating
Abuja,Jan,120,450000,4.6
Lagos,Jan,310,1180000,4.2
Kano,Jan,,210000,3.9
Abuja,Feb,142,512000,4.7
Lagos,Feb,298,1090000,
Enugu,Feb,77,260000,4.1`;

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

function CsvProfiler() {
  const [text, setText] = useState(SAMPLE_CSV);
  const profile = useMemo(() => {
    const rows = parseCsv(text.trim());
    if (rows.length < 2) return null;
    const [header, ...data] = rows;
    return {
      rows: data.length,
      cols: header.map((name, ci) => {
        const vals = data.map((r) => (r[ci] ?? "").trim());
        const present = vals.filter((v) => v !== "");
        const nums = present.map(Number).filter((n) => !isNaN(n));
        const numeric = present.length > 0 && nums.length === present.length;
        const mean = numeric ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        return {
          name,
          type: numeric ? "number" : "text",
          nulls: vals.length - present.length,
          unique: new Set(present).size,
          min: numeric ? Math.min(...nums) : null,
          max: numeric ? Math.max(...nums) : null,
          mean: numeric ? mean : null,
          top: numeric
            ? null
            : Object.entries(present.reduce<Record<string, number>>((m, v) => ((m[v] = (m[v] ?? 0) + 1), m), {})).sort(
                (a, b) => b[1] - a[1],
              )[0]?.[0],
        };
      }),
    };
  }, [text]);

  const fmt = (n: number | null) => (n === null ? "-" : Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 }));

  return (
    <>
      <Field label="CSV" hint="paste data or drop a .csv file · parsed locally">
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.dataTransfer.files[0]?.text().then(setText);
          }}
          style={{ minHeight: 150 }}
        />
      </Field>
      {!profile ? (
        <div className="output badge-fail">Need a header row and at least one data row.</div>
      ) : (
        <>
          <div className="metrics">
            <div className="metric"><b>{profile.rows}</b><span>Rows</span></div>
            <div className="metric"><b>{profile.cols.length}</b><span>Columns</span></div>
            <div className="metric"><b>{profile.cols.filter((c) => c.type === "number").length}</b><span>Numeric</span></div>
            <div className="metric"><b>{profile.cols.reduce((a, c) => a + c.nulls, 0)}</b><span>Missing cells</span></div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Column</th><th>Type</th><th>Missing</th><th>Unique</th><th>Min</th><th>Max</th><th>Mean / top</th></tr>
              </thead>
              <tbody>
                {profile.cols.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.type}</td>
                    <td className={c.nulls ? "badge-fail" : ""}>{c.nulls}</td>
                    <td>{c.unique}</td>
                    <td>{fmt(c.min)}</td>
                    <td>{fmt(c.max)}</td>
                    <td>{c.type === "number" ? fmt(c.mean) : c.top}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────── registry ─────────────── */

export type Tool = { id: string; name: string; group: string; desc: string; Component: () => ReactNode };

export const TOOLS: Tool[] = [
  { id: "palette", name: "Palette Generator", group: "Design", desc: "Tint and shade scales, colour harmonies and CSS tokens", Component: PaletteGen },
  { id: "contrast", name: "Contrast Checker", group: "Design", desc: "WCAG 2 contrast ratios for any colour pair", Component: Contrast },
  { id: "csv", name: "CSV Profiler", group: "Data", desc: "Column types, missing values, uniques and summary stats", Component: CsvProfiler },
  { id: "json", name: "JSON Toolkit", group: "Data", desc: "Validate, format, minify and inspect", Component: JsonToolkit },
  { id: "password", name: "Password Analyzer", group: "Security", desc: "Entropy, pattern detection and offline crack-time modelling", Component: PasswordAnalyzer },
  { id: "hash", name: "Hash Forge", group: "Security", desc: "SHA family digests with WebCrypto, plus hash verification", Component: HashForge },
  { id: "jwt", name: "JWT Dissector", group: "Security", desc: "Decode a token and flag risky algorithms and claims", Component: JwtDissector },
  { id: "subnet", name: "Subnet Calculator", group: "Security", desc: "CIDR maths: network, broadcast, host range", Component: SubnetCalc },
  { id: "regex", name: "Regex Workbench", group: "Engineering", desc: "Live matching, highlighting and capture groups", Component: RegexBench },
  { id: "encoder", name: "Encoder Multi-tool", group: "Engineering", desc: "Base64, URL, hex, HTML entities and ROT13", Component: Encoder },
  { id: "gen", name: "Generator Suite", group: "Engineering", desc: "Passwords, UUIDs and tokens from a CSPRNG", Component: Generators },
];

export const GROUP_COLORS: Record<string, string> = {
  Design: "#f472b6",
  Data: "#f59e0b",
  Security: "#34d399",
  Engineering: "#c084fc",
};

export function selectTool(id: string) {
  window.dispatchEvent(new CustomEvent("lab:select", { detail: id }));
}
