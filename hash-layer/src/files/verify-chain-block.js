import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
async function verifyChainBlock() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const bsc = new BSC();
    const snapshot = await chain.snapshot();
    if (!snapshot) {
        console.error("Failed to get snapshot");
        return;
    }
    // Get current block (the last successful one)
    const currentBlock = snapshot.fields.last_block.fields;
    const currentHeight = BigInt(currentBlock.header.fields.height);
    const currentNonce = BigInt(currentBlock.header.fields.nonce);
    const currentBlockHash = currentBlock.block_hash;
    const difficulty = snapshot.fields.difficulty;
    console.log("=== Current Block (Last Successful) ===");
    console.log(`Height: ${currentHeight}`);
    console.log(`Nonce: ${currentNonce}`);
    console.log(`Block hash: ${Buffer.from(currentBlockHash).toString("hex")}`);
    console.log(`Difficulty: ${difficulty}`);
    console.log();
    // Now let's verify: can we reproduce this block's hash?
    // We need the PREVIOUS block's hash to calculate this block's hash
    // Get the previous block by checking what hash this block has
    // Actually, we can't easily get the previous block from here.
    // But we CAN verify the next block that WE'RE trying to mine
    console.log("=== What we're trying to mine ===");
    console.log(`Next height: ${currentHeight + 1n}`);
    console.log(`Previous hash (current block): ${Buffer.from(currentBlockHash).toString("hex")}`);
    console.log(`Required difficulty: ${difficulty} leading zero bits`);
    console.log();
    // Try a few random nonces and show what hashes we get
    console.log("=== Sample hashes for next block ===");
    for (let i = 0; i < 5; i++) {
        const testNonce = BigInt(Math.floor(Math.random() * 1e12));
        const hash = bsc.getHashBytes(currentHeight + 1n, currentBlockHash, testNonce, new Uint8Array([]));
        const hashHex = Buffer.from(hash).toString("hex");
        console.log(`Nonce ${testNonce}:`);
        console.log(`  Hash: ${hashHex}`);
        // Count leading zero bits
        let leadingZeroBits = 0;
        for (let byte of hash) {
            if (byte === 0) {
                leadingZeroBits += 8;
            }
            else {
                // Count leading zeros in this byte
                for (let bit = 7; bit >= 0; bit--) {
                    if ((byte & (1 << bit)) === 0) {
                        leadingZeroBits++;
                    }
                    else {
                        break;
                    }
                }
                break;
            }
        }
        console.log(`  Leading zero bits: ${leadingZeroBits} (need ${difficulty})`);
        console.log();
    }
    // Now let's try to find what previous hash was used for the current block
    // The current block hash should be: hash(height, previous_hash, nonce, data)
    // But we don't know previous_hash...
    // Actually, let's check if the current block hash matches what we'd expect
    console.log("=== Attempting to verify current block ===");
    console.log("Note: We'd need the previous block's hash to fully verify,");
    console.log("but we can at least check if our hash function format is correct");
    console.log();
    // Let's check all recent events or transactions to see if we can find the previous hash
    console.log("Checking chain object details...");
    const chainObj = await client.client.getObject({
        id: process.env.CHAIN_OBJECT,
        options: {
            showContent: true,
            showType: true,
            showOwner: true,
            showPreviousTransaction: true,
        }
    });
    console.log("Chain object version:", chainObj.data?.version);
    console.log();
}
verifyChainBlock().catch(console.error);
//# sourceMappingURL=verify-chain-block.js.map