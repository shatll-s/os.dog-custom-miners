import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
import koffi from "koffi";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, "..", "libhashminer.so");
const cudaLib = koffi.load(libPath);
const test_hash_block = cudaLib.func("test_hash_block", "void", [
    "uint64", // height
    "uint8 *", // previous_hash (32 bytes)
    "uint64", // nonce
    "uint8 *" // result_hash (32 bytes)
]);
async function compareHashes() {
    // Initialize chain
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const bsc = new BSC();
    // Get current state
    const snapshot = await chain.snapshot();
    if (!snapshot) {
        console.error("Failed to get snapshot");
        return;
    }
    const { header, block_hash } = snapshot.fields.last_block.fields;
    const height = BigInt(header.fields.height);
    console.log("=== Chain State ===");
    console.log(`Height: ${height}`);
    console.log(`Previous hash: ${Buffer.from(block_hash).toString("hex")}`);
    console.log();
    // Test with a fixed nonce
    const testNonce = 12345678n;
    // CPU calculation
    console.log("=== CPU Hash Calculation ===");
    const cpuHash = bsc.getHashBytes(height + 1n, block_hash, testNonce, new Uint8Array([]));
    console.log(`Nonce: ${testNonce}`);
    console.log(`Hash: ${Buffer.from(cpuHash).toString("hex")}`);
    console.log();
    // GPU calculation - direct hash calculation
    console.log("=== GPU Hash Calculation ===");
    const previous_hash = Buffer.from(block_hash);
    const result_hash = Buffer.alloc(32);
    // Call test function to hash exactly this nonce
    test_hash_block(Number(height + 1n), previous_hash, Number(testNonce), result_hash);
    console.log(`Nonce: ${testNonce}`);
    console.log(`Hash: ${result_hash.toString("hex")}`);
    console.log();
    // Compare
    const cpuHashHex = Buffer.from(cpuHash).toString("hex");
    const gpuHashHex = result_hash.toString("hex");
    console.log("=== Comparison ===");
    if (cpuHashHex === gpuHashHex) {
        console.log("✅ Хеши СОВПАДАЮТ! GPU работает правильно.");
    }
    else {
        console.log("❌ Хеши НЕ СОВПАДАЮТ!");
        console.log(`CPU: ${cpuHashHex}`);
        console.log(`GPU: ${gpuHashHex}`);
        // Show byte-by-byte difference
        console.log("\nБайт-байтовое сравнение:");
        const cpuBytes = Buffer.from(cpuHash);
        const gpuBytes = result_hash;
        for (let i = 0; i < 32; i++) {
            const match = cpuBytes[i] === gpuBytes[i] ? "✓" : "✗";
            console.log(`  [${i.toString().padStart(2)}] CPU: ${cpuBytes[i].toString(16).padStart(2, '0')} | GPU: ${gpuBytes[i].toString(16).padStart(2, '0')} ${match}`);
        }
    }
}
compareHashes().catch(console.error);
//# sourceMappingURL=compare-hash.js.map