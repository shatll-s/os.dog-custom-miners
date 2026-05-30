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
const libPath = path.join(__dirname, "..", "libhashminer.so");
const cudaLib = koffi.load(libPath);
const mine_hash_layer = cudaLib.func("mine_hash_layer", "int", [
    "uint64", "uint8 *", "uint64", "uint32", "uint64", "uint64 *", "uint8 *"
]);
const mine_hash_layer_on_device = cudaLib.func("mine_hash_layer_on_device", "int", [
    "uint64", "uint8 *", "uint64", "uint32", "uint64", "uint64 *", "uint8 *", "int"
]);
function bufferToBigInt(buffer) {
    let result = 0n;
    for (let i = 0; i < 8; i++) {
        result |= BigInt(buffer[i]) << (BigInt(i) * 8n);
    }
    return result;
}
async function compareGPUFunctions() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const bsc = new BSC();
    const snapshot = await chain.snapshot();
    if (!snapshot)
        throw new Error("No snapshot");
    const { header, block_hash } = snapshot.fields.last_block.fields;
    const { difficulty } = snapshot.fields;
    const height = BigInt(header.fields.height);
    console.log("=== Testing GPU Functions ===");
    console.log(`Height: ${height}`);
    console.log(`Difficulty: ${difficulty}`);
    console.log();
    const previous_hash = Buffer.from(block_hash);
    const nonce_start = BigInt(Math.floor(Math.random() * 1e15));
    // Test 1: mine_hash_layer (original)
    console.log("1️⃣ Testing mine_hash_layer (original)...");
    const result1_nonce = Buffer.alloc(8);
    const result1_hash = Buffer.alloc(32);
    const found1 = mine_hash_layer(Number(height + 1n), previous_hash, Number(nonce_start), Number(difficulty), 100_000_000, // 100M iterations
    result1_nonce, result1_hash);
    console.log(`Found: ${found1}`);
    if (found1) {
        const nonce1 = bufferToBigInt(result1_nonce);
        const hash1 = result1_hash.toString("hex");
        console.log(`Nonce: ${nonce1}`);
        console.log(`Hash: ${hash1}`);
        // Verify on CPU
        const cpuHash1 = bsc.getHashBytes(height + 1n, block_hash, nonce1, new Uint8Array([]));
        console.log(`CPU Hash: ${Buffer.from(cpuHash1).toString("hex")}`);
        console.log(`Match: ${hash1 === Buffer.from(cpuHash1).toString("hex") ? "✅" : "❌"}`);
    }
    console.log();
    // Test 2: mine_hash_layer_on_device with gpu_id=0
    console.log("2️⃣ Testing mine_hash_layer_on_device (gpu_id=0)...");
    const result2_nonce = Buffer.alloc(8);
    const result2_hash = Buffer.alloc(32);
    const found2 = mine_hash_layer_on_device(Number(height + 1n), previous_hash, Number(nonce_start), Number(difficulty), 100_000_000, // Same 100M iterations
    result2_nonce, result2_hash, 0 // gpu_id = 0
    );
    console.log(`Found: ${found2}`);
    if (found2) {
        const nonce2 = bufferToBigInt(result2_nonce);
        const hash2 = result2_hash.toString("hex");
        console.log(`Nonce: ${nonce2}`);
        console.log(`Hash: ${hash2}`);
        // Verify on CPU
        const cpuHash2 = bsc.getHashBytes(height + 1n, block_hash, nonce2, new Uint8Array([]));
        console.log(`CPU Hash: ${Buffer.from(cpuHash2).toString("hex")}`);
        console.log(`Match: ${hash2 === Buffer.from(cpuHash2).toString("hex") ? "✅" : "❌"}`);
    }
    console.log();
    if (found1 && found2) {
        console.log("=== Comparison ===");
        console.log(`Both functions found blocks: ${found1 && found2 ? "✅" : "❌"}`);
    }
}
compareGPUFunctions().catch(console.error);
//# sourceMappingURL=compare-gpu-functions.js.map