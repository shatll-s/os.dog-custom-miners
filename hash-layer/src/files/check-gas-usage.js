import "./load-env.js";
import SuiClient from "./SuiClient.js";
async function checkGasUsage() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    console.log("Querying recent transactions...\n");
    const txs = await client.client.queryTransactionBlocks({
        filter: {
            InputObject: process.env.CHAIN_OBJECT
        },
        options: {
            showInput: true,
            showEffects: true,
        },
        limit: 50,
        order: "descending"
    });
    let successfulGas = [];
    let failedGas = [];
    for (const tx of txs.data) {
        const gasUsed = tx.effects?.gasUsed;
        if (!gasUsed)
            continue;
        const computationCost = Number(gasUsed.computationCost);
        const storageCost = Number(gasUsed.storageCost);
        const storageRebate = Number(gasUsed.storageRebate);
        const totalGas = computationCost + storageCost - storageRebate;
        if (tx.effects?.status.status === "success") {
            successfulGas.push(totalGas);
        }
        else {
            failedGas.push(totalGas);
        }
    }
    console.log("=== Gas Usage Statistics ===\n");
    if (successfulGas.length > 0) {
        const avgSuccess = successfulGas.reduce((a, b) => a + b, 0) / successfulGas.length;
        const maxSuccess = Math.max(...successfulGas);
        const minSuccess = Math.min(...successfulGas);
        console.log(`Successful transactions (${successfulGas.length}):`);
        console.log(`  Average: ${avgSuccess.toFixed(0)} MIST`);
        console.log(`  Min: ${minSuccess} MIST`);
        console.log(`  Max: ${maxSuccess} MIST`);
        console.log(`  Recommended budget: ${Math.ceil(maxSuccess * 1.2)} MIST (max + 20%)`);
    }
    if (failedGas.length > 0) {
        const avgFailed = failedGas.reduce((a, b) => a + b, 0) / failedGas.length;
        const maxFailed = Math.max(...failedGas);
        const minFailed = Math.min(...failedGas);
        console.log(`\nFailed transactions (${failedGas.length}):`);
        console.log(`  Average: ${avgFailed.toFixed(0)} MIST`);
        console.log(`  Min: ${minFailed} MIST`);
        console.log(`  Max: ${maxFailed} MIST`);
    }
    // Check our current settings
    console.log("\n=== Current Settings ===");
    console.log("Check src/TXService.ts for current gas budget");
}
checkGasUsage().catch(console.error);
//# sourceMappingURL=check-gas-usage.js.map