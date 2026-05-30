import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
async function verifyBlock() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    // Get recent blocks from chain
    const snapshot = await chain.snapshot();
    if (!snapshot) {
        console.error("Failed to get snapshot");
        return;
    }
    const currentHeight = BigInt(snapshot.fields.last_block.fields.header.fields.height);
    console.log(`Current block height: ${currentHeight}`);
    // Check last 5 blocks
    console.log("\nRecent blocks:");
    for (let i = 0; i < 5; i++) {
        const height = currentHeight - BigInt(i);
        console.log(`\nBlock ${height}:`);
        // TODO: Fetch block details
        console.log("  (need to implement block fetching)");
    }
    // Check specific nonce from logs
    const testNonce = 272714587633720n;
    console.log(`\nTesting nonce: ${testNonce}`);
    console.log("  Expected hash: 000000014ce121447e76a19c3c7349ebb1822a495bd511c96b087c4bde1bf858");
}
verifyBlock().catch(console.error);
//# sourceMappingURL=verify-block.js.map