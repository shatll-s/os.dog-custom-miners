import "./load-env.js";
import { bcs } from "@mysten/bcs";
import blake2 from "blake2";
// Test BCS serialization
const height = 48351n;
const previous_hash = Buffer.from("00000004007a87827d12b2f77418a974318c45cfa14a650332303f8af31094f6", "hex");
const nonce = 12345678n;
const data = new Uint8Array([]);
console.log("=== Input Data ===");
console.log(`Height: ${height}`);
console.log(`Previous hash: ${previous_hash.toString("hex")}`);
console.log(`Nonce: ${nonce}`);
console.log(`Data length: ${data.length}`);
console.log();
// BCS serialization
const Block = bcs.struct("Block", {
    height: bcs.u64(),
    previous_hash: bcs.vector(bcs.u8()),
    nonce: bcs.u64(),
    data: bcs.vector(bcs.u8()),
});
const input = {
    height: height.toString(),
    previous_hash: Array.from(previous_hash),
    nonce: nonce.toString(),
    data: Array.from(data)
};
const serialized = Block.serialize(input).toBytes();
console.log("=== BCS Serialized Data ===");
console.log(`Length: ${serialized.length} bytes`);
console.log(`Hex: ${Buffer.from(serialized).toString("hex")}`);
console.log();
// Show byte-by-byte breakdown
console.log("=== Byte-by-byte breakdown ===");
let pos = 0;
// Height (8 bytes, little-endian)
const heightBytes = serialized.slice(pos, pos + 8);
console.log(`Height (u64): ${Buffer.from(heightBytes).toString("hex")}`);
pos += 8;
// Previous hash length (1 byte for length < 128)
const hashLen = serialized[pos];
console.log(`Previous hash length: ${hashLen}`);
pos += 1;
// Previous hash (32 bytes)
const hashBytes = serialized.slice(pos, pos + 32);
console.log(`Previous hash: ${Buffer.from(hashBytes).toString("hex")}`);
pos += 32;
// Nonce (8 bytes, little-endian)
const nonceBytes = serialized.slice(pos, pos + 8);
console.log(`Nonce (u64): ${Buffer.from(nonceBytes).toString("hex")}`);
pos += 8;
// Data length (1 byte for empty data)
const dataLen = serialized[pos];
console.log(`Data length: ${dataLen}`);
pos += 1;
console.log(`Total parsed: ${pos} bytes`);
console.log();
// Now hash it
const hash = blake2.createHash("blake2b", { digestLength: 32 }).update(Buffer.from(serialized)).digest();
console.log("=== Blake2b Hash ===");
console.log(`Hash: ${hash.toString("hex")}`);
//# sourceMappingURL=debug-serialization.js.map