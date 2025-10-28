import blake2 from "blake2";
import koffi from "koffi";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, "..", "libhashminer.so");
const cudaLib = koffi.load(libPath);
const test_blake2b = cudaLib.func("test_blake2b", "void", ["uint8 *", "uint32"]);
// Test GPU Blake2b implementation with empty input
console.log("Testing GPU Blake2b with empty input:");
const emptyInput = Buffer.alloc(0);
test_blake2b(emptyInput, 0);
console.log();
// Test GPU Blake2b with "abc"
console.log("Testing GPU Blake2b with 'abc':");
const abcInput = Buffer.from("abc");
test_blake2b(abcInput, abcInput.length);
console.log();
// Test GPU Blake2b with BCS bytes
const bcsBytes = Buffer.from("45a7000000000000200000000dd5b981d2dc0a599539d0a41c5487500f23160ae83dfc705a7a63d58c15cd5b070000000000", "hex");
console.log("Testing GPU Blake2b with BCS bytes:");
test_blake2b(bcsBytes, bcsBytes.length);
console.log();
// Test with empty input - known Blake2b-256 test vector
const emptyHash = blake2.createHash("blake2b", { digestLength: 32 }).update(Buffer.from([])).digest();
console.log("Blake2b-256 of empty string:");
console.log(`  CPU: ${emptyHash.toString("hex")}`);
console.log(`  Expected: 0e5751c026e543b2e8ab2eb06099daa1d1e5df47778f7787faab45cdf12fe3a8`);
// Test with "abc"
const abcHash = blake2.createHash("blake2b", { digestLength: 32 }).update(Buffer.from("abc")).digest();
console.log("Blake2b-256 of 'abc':");
console.log(`  CPU: ${abcHash.toString("hex")}`);
console.log(`  Expected: bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319`);
// Test with the actual BCS serialized bytes
const bcsHash = blake2.createHash("blake2b", { digestLength: 32 }).update(bcsBytes).digest();
console.log("\nBlake2b-256 of BCS bytes:");
console.log(`  CPU: ${bcsHash.toString("hex")}`);
console.log(`  Expected from GPU test above`);
//# sourceMappingURL=test-blake2b.js.map