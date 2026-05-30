import "./load-env.js";
import SuiClient from "./SuiClient.js";
async function inspectContract() {
    const client = new SuiClient(process.env.RPC_PROVIDER);
    console.log("Fetching contract package...");
    const packageId = process.env.HASH_CONTRACT;
    try {
        const packageObj = await client.client.getNormalizedMoveModulesByPackage({
            package: packageId
        });
        console.log("Available modules:", Object.keys(packageObj));
        if (packageObj.hash_layer) {
            console.log("\n=== hash_layer module ===");
            // Look at exposed functions
            const module = packageObj.hash_layer;
            console.log("\nExposed functions:");
            Object.keys(module.exposedFunctions).forEach((fnName) => {
                const fn = module.exposedFunctions[fnName];
                console.log(`\n${fnName}:`);
                console.log(`  Parameters: ${JSON.stringify(fn.parameters, null, 2)}`);
                console.log(`  Return: ${JSON.stringify(fn.return, null, 2)}`);
            });
            // Look at structs
            console.log("\n\nStructs:");
            Object.keys(module.structs).forEach((structName) => {
                const struct = module.structs[structName];
                console.log(`\n${structName}:`);
                console.log(`  Fields: ${JSON.stringify(struct.fields, null, 2)}`);
            });
        }
    }
    catch (err) {
        console.error("Error fetching contract:", err);
    }
}
inspectContract().catch(console.error);
//# sourceMappingURL=inspect-contract.js.map