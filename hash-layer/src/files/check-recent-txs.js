import "./load-env.js";
import SuiClient from "./SuiClient.js";
async function checkRecentTxs() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const walletAddress = process.env.WALLET_ADDRESS;
    console.log("Fetching last 30 transactions...\n");
    const result = await client.client.queryTransactionBlocks({
        filter: { FromAddress: walletAddress },
        options: {
            showEffects: true,
            showInput: true,
        },
        limit: 30,
        order: "descending",
    });
    let successCount = 0;
    let failCount = 0;
    let abortCount = 0;
    console.log("Recent transactions:");
    for (const tx of result.data) {
        const status = tx.effects?.status;
        const isSuccess = status?.status === "success";
        const statusIcon = isSuccess ? "✅" : "❌";
        if (isSuccess) {
            successCount++;
        }
        else {
            failCount++;
            if (status?.error?.includes("MoveAbort")) {
                abortCount++;
            }
        }
        const shortDigest = tx.digest.substring(0, 8);
        console.log(`  ${statusIcon} ${shortDigest}: ${status?.status}`);
        if (!isSuccess && status?.error) {
            const errorMsg = status.error;
            if (errorMsg.includes("MoveAbort")) {
                const match = errorMsg.match(/}, (\d+)\)/);
                const errorCode = match ? match[1] : "unknown";
                console.log(`      Error: MoveAbort(${errorCode})`);
            }
            else {
                console.log(`      Error: ${errorMsg.substring(0, 60)}...`);
            }
        }
    }
    console.log(`\n=== Statistics (last ${result.data.length} transactions) ===`);
    console.log(`✅ Successful: ${successCount} (${(successCount / result.data.length * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failCount} (${(failCount / result.data.length * 100).toFixed(1)}%)`);
    console.log(`   - MoveAbort: ${abortCount}`);
    console.log(`   - Other: ${failCount - abortCount}`);
}
checkRecentTxs().catch(console.error);
//# sourceMappingURL=check-recent-txs.js.map