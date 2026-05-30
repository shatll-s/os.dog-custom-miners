import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
async function testHeightVariants() {
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
    const { difficulty } = snapshot.fields;
    const height = BigInt(header.fields.height);
    console.log("=== Chain State ===");
    console.log(`Current height: ${height}`);
    console.log(`Difficulty: ${difficulty}`);
    console.log(`Previous hash: ${Buffer.from(block_hash).toString("hex")}`);
    console.log();
    const testNonce = 12345678n;
    // Test different height values
    console.log("=== Testing different height values ===\n");
    const heightVariants = [
        { name: "height - 1", value: height - 1n },
        { name: "height", value: height },
        { name: "height + 1", value: height + 1n },
        { name: "height + 2", value: height + 2n },
    ];
    for (const variant of heightVariants) {
        const hash = bsc.getHashBytes(variant.value, block_hash, testNonce, new Uint8Array([]));
        console.log(`Using ${variant.name} (${variant.value}):`);
        console.log(`  Hash: ${Buffer.from(hash).toString("hex")}`);
        // Check if this hash would pass the difficulty check
        const fullZeroBytes = Math.floor(Number(difficulty) / 8);
        const partialBits = Number(difficulty) % 8;
        let passes = true;
        for (let i = 0; i < fullZeroBytes; i++) {
            if (hash[i] !== 0) {
                passes = false;
                break;
            }
        }
        if (passes && partialBits > 0) {
            const byte = hash[fullZeroBytes];
            const mask = (0xff << (8 - partialBits)) & 0xff;
            if ((byte & mask) !== 0) {
                passes = false;
            }
        }
        console.log(`  Passes difficulty ${difficulty}: ${passes ? "✓" : "✗"}`);
        console.log();
    }
    // Also test with next block's hash (in case we should be using that)
    console.log("=== Testing with zero hash (as if starting new chain) ===\n");
    const zeroHash = new Uint8Array(32);
    for (const variant of heightVariants) {
        const hash = bsc.getHashBytes(variant.value, zeroHash, testNonce, new Uint8Array([]));
        console.log(`Using ${variant.name} (${variant.value}) with zero hash:`);
        console.log(`  Hash: ${Buffer.from(hash).toString("hex").substring(0, 64)}...`);
    }
}
testHeightVariants().catch(console.error);
//# sourceMappingURL=test-height-variants.js.map