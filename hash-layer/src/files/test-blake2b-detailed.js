import blake2 from "blake2";
// Test Blake2b initialization parameters
console.log("Testing Blake2b-256 parameters:\n");
const bcsBytes = Buffer.from("45a7000000000000200000000dd5b981d2dc0a599539d0a41c5487500f23160ae83dfc705a7a63d58c15cd5b070000000000", "hex");
// Create hasher
const hasher = blake2.createHash("blake2b", { digestLength: 32 });
// Check if there are any other parameters
console.log("Blake2 hasher config:");
console.log("  digestLength:", 32);
console.log("  Expected h[0] initialization: 0x6a09e667f2bdc928 XOR 0x01010020 =", (0x6a09e667f2bdc928n ^ 0x01010020n).toString(16));
// Hash the BCS bytes
const hash = hasher.update(bcsBytes).digest();
console.log("\nCPU Blake2b-256 of 50-byte BCS:");
console.log("  Hash:", hash.toString("hex"));
console.log("\nExpected GPU hash: 2629014db36a5fdfcc37a0dd848384f2481b6f3c852cc83d40c501b476e15723");
console.log("Mismatch:", hash.toString("hex") !== "2629014db36a5fdfcc37a0dd848384f2481b6f3c852cc83d40c501b476e15723");
//# sourceMappingURL=test-blake2b-detailed.js.map