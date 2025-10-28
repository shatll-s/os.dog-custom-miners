import "./load-env.js";
import koffi from "koffi";
import path from "path";
import { fileURLToPath } from "url";
import BSC from "./BSC.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, "..", "libhashminer.so");
const cudaLib = koffi.load(libPath);
const mine_hash_layer = cudaLib.func("mine_hash_layer", "int", [
    "uint64", "uint8 *", "uint64", "uint32", "uint64", "uint64 *", "uint8 *"
]);
async function testHashes() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const bsc = new BSC();
    const snapshot = await chain.snapshot();
    if (!snapshot) {
        console.error("Failed to get snapshot");
        return;
    }
    const { header, block_hash } = snapshot.fields.last_block.fields;
    const { difficulty } = snapshot.fields;
    const height = BigInt(header.fields.height);
    console.log(`Testing hashes for block ${height + 1n}`);
    console.log(`Previous hash: ${Buffer.from(block_hash).toString("hex")}`);
    console.log(`Difficulty: ${difficulty} bits\n`);
    // Test nonce
    const testNonce = 123456789n;
    // CPU Blake2b - with serialization debug
    const Block = (await import("@mysten/bcs")).bcs.struct("Block", {
        height: (await import("@mysten/bcs")).bcs.u64(),
        previous_hash: (await import("@mysten/bcs")).bcs.vector((await import("@mysten/bcs")).bcs.u8()),
        nonce: (await import("@mysten/bcs")).bcs.u64(),
        data: (await import("@mysten/bcs")).bcs.vector((await import("@mysten/bcs")).bcs.u8()),
    });
    const input = {
        height: (height + 1n).toString(),
        previous_hash: block_hash,
        nonce: testNonce.toString(),
        data: new Uint8Array([])
    };
    const cpuBytes = Block.serialize(input).toBytes();
    console.log(`[CPU BCS] Serialized ${cpuBytes.length} bytes for nonce ${testNonce}:`);
    console.log(`  Raw bytes: ${Buffer.from(cpuBytes).toString("hex")}`);
    console.log(`  Height bytes: ${Buffer.from(cpuBytes.slice(0, 8)).toString("hex").replace(/(.{2})/g, "$1 ").trim()}`);
    console.log(`  Prev hash len: ${cpuBytes[8]?.toString(16).padStart(2, '0')}`);
    console.log(`  Prev hash: ${Buffer.from(cpuBytes.slice(9, 41)).toString("hex")}`);
    console.log(`  Nonce bytes: ${Buffer.from(cpuBytes.slice(41, 49)).toString("hex").replace(/(.{2})/g, "$1 ").trim()}`);
    console.log(`  Data len: ${cpuBytes[49]?.toString(16).padStart(2, '0')}`);
    const cpuHash = bsc.getHashBytes(height + 1n, block_hash, testNonce, new Uint8Array([]));
    console.log(`CPU Blake2b (nonce ${testNonce}):`);
    console.log(`  Hash: ${Buffer.from(cpuHash).toString("hex")}`);
    // GPU Blake2b
    const previous_hash = Buffer.from(block_hash);
    const result_nonce = Buffer.alloc(8);
    const result_hash = Buffer.alloc(32);
    // Force GPU to compute just one hash
    mine_hash_layer(Number(height + 1n), previous_hash, Number(testNonce), 0, // difficulty = 0 means any hash is valid
    1, // only 1 iteration
    result_nonce, result_hash);
    console.log(`GPU Blake2b (nonce ${testNonce}):`);
    console.log(`  Hash: ${result_hash.toString("hex")}`);
    // Compare
    const cpuHex = Buffer.from(cpuHash).toString("hex");
    const gpuHex = result_hash.toString("hex");
    if (cpuHex === gpuHex) {
        console.log("\n✅ HASHES MATCH! GPU Blake2b is correct!");
    }
    else {
        console.log("\n❌ HASHES DON'T MATCH!");
        console.log("\nDifference:");
        for (let i = 0; i < 32; i++) {
            if (cpuHash[i] !== result_hash[i]) {
                console.log(`  Byte ${i}: CPU=${cpuHash[i]?.toString(16).padStart(2, '0')} GPU=${result_hash[i]?.toString(16).padStart(2, '0')}`);
            }
        }
    }
}
testHashes().catch(console.error);
//# sourceMappingURL=test-hash.js.map