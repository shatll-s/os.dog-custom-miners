import "./load-env.js";
import SuiClient from "./SuiClient.js";
async function checkSuccessfulTx() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    // Get the chain object to find recent transactions
    const chainObj = await client.client.getObject({
        id: process.env.CHAIN_OBJECT,
        options: {
            showPreviousTransaction: true,
        }
    });
    if (!chainObj.data?.previousTransaction) {
        console.log("No previous transaction found");
        return;
    }
    const latestTx = chainObj.data.previousTransaction;
    console.log("Latest transaction that modified chain:", latestTx);
    // Get transaction details
    const txDetails = await client.client.getTransactionBlock({
        digest: latestTx,
        options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
        }
    });
    console.log("\n=== Transaction Details ===");
    console.log("Status:", JSON.stringify(txDetails.effects?.status, null, 2));
    console.log("\nSender:", txDetails.transaction?.data.sender);
    if (txDetails.transaction?.data.transaction.kind === "ProgrammableTransaction") {
        const ptx = txDetails.transaction.data.transaction;
        console.log("\n=== Transaction Inputs ===");
        ptx.inputs?.forEach((input, i) => {
            console.log(`Input ${i}:`, JSON.stringify(input, null, 2));
        });
        console.log("\n=== Transaction Commands ===");
        ptx.transactions?.forEach((cmd, i) => {
            console.log(`Command ${i}:`, JSON.stringify(cmd, null, 2));
        });
    }
    console.log("\n=== Events ===");
    txDetails.events?.forEach((event, i) => {
        console.log(`Event ${i}:`, JSON.stringify(event, null, 2));
    });
}
checkSuccessfulTx().catch(console.error);
//# sourceMappingURL=check-successful-tx.js.map