// Test to see what the m[] array should look like for the BCS bytes
const bcsBytes = Buffer.from("45a7000000000000200000000dd5b981d2dc0a599539d0a41c5487500f23160ae83dfc705a7a63d58c15cd5b070000000000", "hex");
console.log("BCS bytes (50 bytes):", bcsBytes.toString("hex"));
console.log("\nPacking into m[] array (little-endian uint64):");
const m = new BigUint64Array(16);
for (let i = 0; i < 50; i++) {
    const idx = Math.floor(i / 8);
    const shift = BigInt((i % 8) * 8);
    const byte = bcsBytes[i];
    if (byte !== undefined) {
        m[idx] = (m[idx] || 0n) | (BigInt(byte) << shift);
    }
}
for (let i = 0; i < 7; i++) {
    const val = m[i];
    if (val !== undefined) {
        console.log(`m[${i}] = 0x${val.toString(16).padStart(16, '0')}`);
    }
}
export {};
//# sourceMappingURL=test-m-array.js.map