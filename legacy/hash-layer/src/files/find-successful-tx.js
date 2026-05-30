import "./load-env.js";
import SuiClient from "./SuiClient.js";
async function findSuccessfulTx() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    console.log("Querying transactions on CHAIN_OBJECT...\n");
    // Query all transactions that involve the chain object
    const txs = await client.client.queryTransactionBlocks({
        filter: {
            InputObject: process.env.CHAIN_OBJECT
        },
        options: {
            showInput: true,
            showEffects: true,
        },
        limit: 50, // Get last 50 transactions
        order: "descending"
    });
    console.log(`Found ${txs.data.length} transactions`);
    // Find first successful one
    for (const tx of txs.data) {
        if (tx.effects?.status.status === "success") {
            console.log("\n=== Found Successful Transaction ===");
            console.log("Digest:", tx.digest);
            console.log("Sender:", tx.transaction?.data.sender);
            if (tx.transaction?.data.transaction.kind === "ProgrammableTransaction") {
                const ptx = tx.transaction.data.transaction;
                console.log("\n=== Inputs ===");
                ptx.inputs?.forEach((input, i) => {
                    console.log(`Input ${i}:`, JSON.stringify(input, null, 2));
                });
            }
            // Get full details
            const fullTx = await client.client.getTransactionBlock({
                digest: tx.digest,
                options: {
                    showInput: true,
                    showEffects: true,
                    showEvents: true,
                }
            });
            console.log("\n=== Events ===");
            fullTx.events?.forEach((event) => {
                if (event.type.includes("BlockCreated")) {
                    console.log("BlockCreated event:", JSON.stringify(event, null, 2));
                }
            });
            break; // Found one, that's enough
        }
    }
    // Also count how many failed vs succeeded
    let successCount = 0;
    let failCount = 0;
    for (const tx of txs.data) {
        if (tx.effects?.status.status === "success") {
            successCount++;
        }
        else {
            failCount++;
        }
    }
    console.log(`\n\n=== Statistics (last 50 transactions) ===`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success rate: ${(successCount / txs.data.length * 100).toFixed(1)}%`);
}
findSuccessfulTx().catch(console.error);
//# sourceMappingURL=find-successful-tx.js.map