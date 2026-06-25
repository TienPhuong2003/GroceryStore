const require_rolldown_runtime = require('../_virtual/rolldown_runtime.cjs');
let hash_js = require("hash.js");
hash_js = require_rolldown_runtime.__toESM(hash_js);

//#region src/helpers/deterministicId.ts
/**
* Produces span IDs identical to the Go executor's
* `DeterministicSpanConfig(seed).SpanID` in `pkg/tracing/tracer.go`.
*
* Algorithm: SHA-256 the seed, interpret the 32-byte digest as a ChaCha8
* key, then read 24 bytes from Go's `chacha8rand` PRNG
* (https://c2sp.org/chacha8rand) — 16 bytes for TraceID (discarded) plus
* 8 bytes for SpanID (returned).  This is the 3rd uint64 in the
* interleaved output buffer (buf[2] = word 1 from blocks 0 and 1).
*
* Uses `hash.js` for SHA-256 (same as the rest of the SDK) so it works in
* Node, browsers, and edge runtimes without `node:crypto`.
*/
const { sha256 } = hash_js.default;
/**
* Compute a deterministic 8-byte span ID from an arbitrary seed string,
* byte-for-byte compatible with Go's `DeterministicSpanConfig(seed).SpanID`.
*
* Returns the span ID as a 16-character hex string (the format OTel uses).
*/
function deterministicSpanID(seed) {
	return uint64ToLEHex(chacha8randThirdUint64(sha256().update(seed).digest()));
}
/**
* Compute blocks 0 and 1 (counters 0,1) and return the 3rd uint64 (buf[2])
* of the interleaved output buffer.  This matches `DeterministicSpanConfig.SpanID`
* which reads 16 bytes (TraceID = buf[0..1]) then 8 bytes (SpanID = buf[2]).
*
* The chacha8rand interleaved layout is:
*   buf[2*i]   = block0[i] | block1[i] << 32
*   buf[2*i+1] = block2[i] | block3[i] << 32
* So buf[2] = buf[2*1] = block0[1] | block1[1] << 32 = s1 from both blocks.
*/
function chacha8randThirdUint64(key) {
	const k = new Uint32Array(8);
	for (let i = 0; i < 8; i++) k[i] = (key[i * 4] | key[i * 4 + 1] << 8 | key[i * 4 + 2] << 16 | key[i * 4 + 3] << 24) >>> 0;
	let s0 = 1634760805;
	let s1 = 857760878;
	let s2 = 2036477234;
	let s3 = 1797285236;
	let s4 = k[0];
	let s5 = k[1];
	let s6 = k[2];
	let s7 = k[3];
	let s8 = k[4];
	let s9 = k[5];
	let s10 = k[6];
	let s11 = k[7];
	let s12 = 0;
	let s13 = 0;
	let s14 = 0;
	let s15 = 0;
	const ok4 = s4, ok5 = s5, ok6 = s6, ok7 = s7;
	const ok8 = s8, ok9 = s9, ok10 = s10, ok11 = s11;
	for (let i = 0; i < 4; i++) {
		s0 = s0 + s4 >>> 0;
		s12 ^= s0;
		s12 = (s12 << 16 | s12 >>> 16) >>> 0;
		s8 = s8 + s12 >>> 0;
		s4 ^= s8;
		s4 = (s4 << 12 | s4 >>> 20) >>> 0;
		s0 = s0 + s4 >>> 0;
		s12 ^= s0;
		s12 = (s12 << 8 | s12 >>> 24) >>> 0;
		s8 = s8 + s12 >>> 0;
		s4 ^= s8;
		s4 = (s4 << 7 | s4 >>> 25) >>> 0;
		s1 = s1 + s5 >>> 0;
		s13 ^= s1;
		s13 = (s13 << 16 | s13 >>> 16) >>> 0;
		s9 = s9 + s13 >>> 0;
		s5 ^= s9;
		s5 = (s5 << 12 | s5 >>> 20) >>> 0;
		s1 = s1 + s5 >>> 0;
		s13 ^= s1;
		s13 = (s13 << 8 | s13 >>> 24) >>> 0;
		s9 = s9 + s13 >>> 0;
		s5 ^= s9;
		s5 = (s5 << 7 | s5 >>> 25) >>> 0;
		s2 = s2 + s6 >>> 0;
		s14 ^= s2;
		s14 = (s14 << 16 | s14 >>> 16) >>> 0;
		s10 = s10 + s14 >>> 0;
		s6 ^= s10;
		s6 = (s6 << 12 | s6 >>> 20) >>> 0;
		s2 = s2 + s6 >>> 0;
		s14 ^= s2;
		s14 = (s14 << 8 | s14 >>> 24) >>> 0;
		s10 = s10 + s14 >>> 0;
		s6 ^= s10;
		s6 = (s6 << 7 | s6 >>> 25) >>> 0;
		s3 = s3 + s7 >>> 0;
		s15 ^= s3;
		s15 = (s15 << 16 | s15 >>> 16) >>> 0;
		s11 = s11 + s15 >>> 0;
		s7 ^= s11;
		s7 = (s7 << 12 | s7 >>> 20) >>> 0;
		s3 = s3 + s7 >>> 0;
		s15 ^= s3;
		s15 = (s15 << 8 | s15 >>> 24) >>> 0;
		s11 = s11 + s15 >>> 0;
		s7 ^= s11;
		s7 = (s7 << 7 | s7 >>> 25) >>> 0;
		s0 = s0 + s5 >>> 0;
		s15 ^= s0;
		s15 = (s15 << 16 | s15 >>> 16) >>> 0;
		s10 = s10 + s15 >>> 0;
		s5 ^= s10;
		s5 = (s5 << 12 | s5 >>> 20) >>> 0;
		s0 = s0 + s5 >>> 0;
		s15 ^= s0;
		s15 = (s15 << 8 | s15 >>> 24) >>> 0;
		s10 = s10 + s15 >>> 0;
		s5 ^= s10;
		s5 = (s5 << 7 | s5 >>> 25) >>> 0;
		s1 = s1 + s6 >>> 0;
		s12 ^= s1;
		s12 = (s12 << 16 | s12 >>> 16) >>> 0;
		s11 = s11 + s12 >>> 0;
		s6 ^= s11;
		s6 = (s6 << 12 | s6 >>> 20) >>> 0;
		s1 = s1 + s6 >>> 0;
		s12 ^= s1;
		s12 = (s12 << 8 | s12 >>> 24) >>> 0;
		s11 = s11 + s12 >>> 0;
		s6 ^= s11;
		s6 = (s6 << 7 | s6 >>> 25) >>> 0;
		s2 = s2 + s7 >>> 0;
		s13 ^= s2;
		s13 = (s13 << 16 | s13 >>> 16) >>> 0;
		s8 = s8 + s13 >>> 0;
		s7 ^= s8;
		s7 = (s7 << 12 | s7 >>> 20) >>> 0;
		s2 = s2 + s7 >>> 0;
		s13 ^= s2;
		s13 = (s13 << 8 | s13 >>> 24) >>> 0;
		s8 = s8 + s13 >>> 0;
		s7 ^= s8;
		s7 = (s7 << 7 | s7 >>> 25) >>> 0;
		s3 = s3 + s4 >>> 0;
		s14 ^= s3;
		s14 = (s14 << 16 | s14 >>> 16) >>> 0;
		s9 = s9 + s14 >>> 0;
		s4 ^= s9;
		s4 = (s4 << 12 | s4 >>> 20) >>> 0;
		s3 = s3 + s4 >>> 0;
		s14 ^= s3;
		s14 = (s14 << 8 | s14 >>> 24) >>> 0;
		s9 = s9 + s14 >>> 0;
		s4 ^= s9;
		s4 = (s4 << 7 | s4 >>> 25) >>> 0;
	}
	s4 = s4 + ok4 >>> 0;
	s5 = s5 + ok5 >>> 0;
	s6 = s6 + ok6 >>> 0;
	s7 = s7 + ok7 >>> 0;
	s8 = s8 + ok8 >>> 0;
	s9 = s9 + ok9 >>> 0;
	s10 = s10 + ok10 >>> 0;
	s11 = s11 + ok11 >>> 0;
	const hi = chacha8randColumn1Row1(k);
	return BigInt(s1 >>> 0) | BigInt(hi >>> 0) << 32n;
}
/**
* Run chacha8rand for column 1 (counter = 1) and return row 1 (s1).
*/
function chacha8randColumn1Row1(k) {
	let s0 = 1634760805;
	let s1 = 857760878;
	let s2 = 2036477234;
	let s3 = 1797285236;
	let s4 = k[0];
	let s5 = k[1];
	let s6 = k[2];
	let s7 = k[3];
	let s8 = k[4];
	let s9 = k[5];
	let s10 = k[6];
	let s11 = k[7];
	let s12 = 1;
	let s13 = 0;
	let s14 = 0;
	let s15 = 0;
	for (let i = 0; i < 4; i++) {
		s0 = s0 + s4 >>> 0;
		s12 ^= s0;
		s12 = (s12 << 16 | s12 >>> 16) >>> 0;
		s8 = s8 + s12 >>> 0;
		s4 ^= s8;
		s4 = (s4 << 12 | s4 >>> 20) >>> 0;
		s0 = s0 + s4 >>> 0;
		s12 ^= s0;
		s12 = (s12 << 8 | s12 >>> 24) >>> 0;
		s8 = s8 + s12 >>> 0;
		s4 ^= s8;
		s4 = (s4 << 7 | s4 >>> 25) >>> 0;
		s1 = s1 + s5 >>> 0;
		s13 ^= s1;
		s13 = (s13 << 16 | s13 >>> 16) >>> 0;
		s9 = s9 + s13 >>> 0;
		s5 ^= s9;
		s5 = (s5 << 12 | s5 >>> 20) >>> 0;
		s1 = s1 + s5 >>> 0;
		s13 ^= s1;
		s13 = (s13 << 8 | s13 >>> 24) >>> 0;
		s9 = s9 + s13 >>> 0;
		s5 ^= s9;
		s5 = (s5 << 7 | s5 >>> 25) >>> 0;
		s2 = s2 + s6 >>> 0;
		s14 ^= s2;
		s14 = (s14 << 16 | s14 >>> 16) >>> 0;
		s10 = s10 + s14 >>> 0;
		s6 ^= s10;
		s6 = (s6 << 12 | s6 >>> 20) >>> 0;
		s2 = s2 + s6 >>> 0;
		s14 ^= s2;
		s14 = (s14 << 8 | s14 >>> 24) >>> 0;
		s10 = s10 + s14 >>> 0;
		s6 ^= s10;
		s6 = (s6 << 7 | s6 >>> 25) >>> 0;
		s3 = s3 + s7 >>> 0;
		s15 ^= s3;
		s15 = (s15 << 16 | s15 >>> 16) >>> 0;
		s11 = s11 + s15 >>> 0;
		s7 ^= s11;
		s7 = (s7 << 12 | s7 >>> 20) >>> 0;
		s3 = s3 + s7 >>> 0;
		s15 ^= s3;
		s15 = (s15 << 8 | s15 >>> 24) >>> 0;
		s11 = s11 + s15 >>> 0;
		s7 ^= s11;
		s7 = (s7 << 7 | s7 >>> 25) >>> 0;
		s0 = s0 + s5 >>> 0;
		s15 ^= s0;
		s15 = (s15 << 16 | s15 >>> 16) >>> 0;
		s10 = s10 + s15 >>> 0;
		s5 ^= s10;
		s5 = (s5 << 12 | s5 >>> 20) >>> 0;
		s0 = s0 + s5 >>> 0;
		s15 ^= s0;
		s15 = (s15 << 8 | s15 >>> 24) >>> 0;
		s10 = s10 + s15 >>> 0;
		s5 ^= s10;
		s5 = (s5 << 7 | s5 >>> 25) >>> 0;
		s1 = s1 + s6 >>> 0;
		s12 ^= s1;
		s12 = (s12 << 16 | s12 >>> 16) >>> 0;
		s11 = s11 + s12 >>> 0;
		s6 ^= s11;
		s6 = (s6 << 12 | s6 >>> 20) >>> 0;
		s1 = s1 + s6 >>> 0;
		s12 ^= s1;
		s12 = (s12 << 8 | s12 >>> 24) >>> 0;
		s11 = s11 + s12 >>> 0;
		s6 ^= s11;
		s6 = (s6 << 7 | s6 >>> 25) >>> 0;
		s2 = s2 + s7 >>> 0;
		s13 ^= s2;
		s13 = (s13 << 16 | s13 >>> 16) >>> 0;
		s8 = s8 + s13 >>> 0;
		s7 ^= s8;
		s7 = (s7 << 12 | s7 >>> 20) >>> 0;
		s2 = s2 + s7 >>> 0;
		s13 ^= s2;
		s13 = (s13 << 8 | s13 >>> 24) >>> 0;
		s8 = s8 + s13 >>> 0;
		s7 ^= s8;
		s7 = (s7 << 7 | s7 >>> 25) >>> 0;
		s3 = s3 + s4 >>> 0;
		s14 ^= s3;
		s14 = (s14 << 16 | s14 >>> 16) >>> 0;
		s9 = s9 + s14 >>> 0;
		s4 ^= s9;
		s4 = (s4 << 12 | s4 >>> 20) >>> 0;
		s3 = s3 + s4 >>> 0;
		s14 ^= s3;
		s14 = (s14 << 8 | s14 >>> 24) >>> 0;
		s9 = s9 + s14 >>> 0;
		s4 ^= s9;
		s4 = (s4 << 7 | s4 >>> 25) >>> 0;
	}
	return s1;
}
/** Convert a uint64 bigint to a 16-char little-endian hex string. */
function uint64ToLEHex(v) {
	let out = "";
	for (let i = 0; i < 8; i++) out += (Number(v >> BigInt(i * 8) & 255n) | 256).toString(16).slice(1);
	return out;
}

//#endregion
exports.deterministicSpanID = deterministicSpanID;
//# sourceMappingURL=deterministicId.cjs.map