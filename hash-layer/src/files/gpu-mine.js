import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
import TXService from "./TXService.js";
import { GPUMiner } from "./GPUMiner.js";
async function main() {
    console.log("==================================");
    console.log("Hash Layer GPU Miner");
    console.log("==================================");
    console.log(`RPC Provider: ${process.env.RPC_PROVIDER}`);
    console.log(`Contract: ${process.env.HASH_CONTRACT}`);
    console.log("==================================\n");
    // Initialize components
    const bsc = new BSC();
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const txService = new TXService(client, process.env.MNEMONIC, process.env.HASH_CONTRACT);
    // Check if CUDA is available
    const gpuMiner = new GPUMiner(bsc, chain, txService);
    if (!gpuMiner.isAvailable()) {
        console.error("❌ CUDA library not available");
        console.log("\nTo compile the GPU miner:");
        console.log("1. Make sure CUDA toolkit is installed");
        console.log("2. Run: make");
        process.exit(1);
    }
    // Get initial chain state
    const snapshot = await chain.snapshot();
    if (snapshot) {
        const { header } = snapshot.fields.last_block.fields;
        const { difficulty } = snapshot.fields;
        console.log(`📊 Текущий блок: ${header.fields.height}`);
        console.log(`🎯 Сложность: ${difficulty} bits\n`);
    }
    // Start mining
    await gpuMiner.mineOnGPU();
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=gpu-mine.js.map