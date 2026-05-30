import koffi from "koffi";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, "..", "libhashminer.so");
const cudaLib = koffi.load(libPath);
const mine_hash_layer = cudaLib.func("mine_hash_layer", "int", [
    "uint64", // height
    "uint8 *", // previous_hash (32 bytes)
    "uint64", // nonce_start
    "uint32", // difficulty
    "uint64", // iterations
    "uint64 *", // result_nonce
    "uint8 *" // result_hash (32 bytes)
]);
// Test nonce conversion
console.log("=== Test Nonce Conversion ===\n");
// Create a test with a known nonce
const testNonce = 12345678n;
console.log(`Input nonce: ${testNonce}`);
// Prepare buffers
const previous_hash = Buffer.alloc(32);
const result_nonce = Buffer.alloc(8);
const result_hash = Buffer.alloc(32);
// Call GPU with difficulty 0 (accept any hash) and iterations that will definitely include our nonce
const found = mine_hash_layer(48382, previous_hash, Number(testNonce), 0, // difficulty 0 = accept any hash
1, // just 1 iteration per thread, but many threads
result_nonce, result_hash);
console.log(`\nGPU found: ${found}`);
console.log(`result_nonce buffer (hex): ${result_nonce.toString("hex")}`);
// Method 1: Our current bufferToBigInt
function bufferToBigInt(buffer) {
    let result = 0n;
    for (let i = 0; i < 8; i++) {
        result |= BigInt(buffer[i]) << (BigInt(i) * 8n);
    }
    return result;
}
// Method 2: Direct read as uint64_t (little-endian)
function bufferToBigIntDirect(buffer) {
    return buffer.readBigUInt64LE(0);
}
const nonce1 = bufferToBigInt(result_nonce);
const nonce2 = bufferToBigIntDirect(result_nonce);
console.log(`\nMethod 1 (current): ${nonce1}`);
console.log(`Method 2 (direct):  ${nonce2}`);
console.log(`\nMethods match: ${nonce1 === nonce2}`);
//# sourceMappingURL=test-nonce-conversion.js.map