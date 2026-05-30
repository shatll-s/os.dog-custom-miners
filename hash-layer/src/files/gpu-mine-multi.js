import "./load-env.js";
import SuiClient from "./SuiClient.js";
import Chain from "./Chain.js";
import Adapter from "./Adapter.js";
import BSC from "./BSC.js";
import TXService from "./TXService.js";
import { GPUMiner, getGPUCount } from "./GPUMiner.js";
import { MiningCoordinator } from "./MiningCoordinator.js";
async function main() {
    console.log("==================================");
    console.log("Hash Layer Multi-GPU Miner");
    console.log("==================================");
    console.log(`RPC Provider: ${process.env.RPC_PROVIDER}`);
    console.log(`Contract: ${process.env.HASH_CONTRACT}`);
    // Check GPU count
    const gpuCount = getGPUCount();
    console.log(`🎮 Detected GPUs: ${gpuCount}`);
    console.log("==================================\n");
    if (gpuCount === 0) {
        console.error("❌ No CUDA-capable GPUs found");
        console.log("\nTo compile the GPU miner:");
        console.log("1. Make sure CUDA toolkit is installed");
        console.log("2. Run: make");
        process.exit(1);
    }
    // Initialize shared components
    const bsc = new BSC();
    const client = new SuiClient(process.env.RPC_PROVIDER);
    const adapter = new Adapter();
    const chain = new Chain(client, adapter);
    const txService = new TXService(client, process.env.MNEMONIC, process.env.HASH_CONTRACT);
    // Get initial chain state
    const snapshot = await chain.snapshot();
    if (snapshot) {
        const { header } = snapshot.fields.last_block.fields;
        const { difficulty } = snapshot.fields;
        console.log(`📊 Текущий блок: ${header.fields.height}`);
        console.log(`🎯 Сложность: ${difficulty} bits\n`);
    }
    // Create coordinator to prevent GPU competition
    const coordinator = new MiningCoordinator();
    console.log(`🔗 Coordinator initialized for ${gpuCount} GPU(s)`);
    // Create miners for each GPU
    const miners = [];
    for (let i = 0; i < gpuCount; i++) {
        const miner = new GPUMiner(bsc, chain, txService, 1000000000n, i, gpuCount, coordinator);
        miners.push(miner);
        console.log(`✅ Initialized miner for GPU ${i}`);
    }
    console.log(`\n🚀 Starting coordinated mining on ${gpuCount} GPU(s)...\n`);
    // Start all miners in parallel
    const miningPromises = miners.map((miner) => miner.mineOnGPU());
    // Wait for any miner to finish (which should never happen in normal operation)
    await Promise.race(miningPromises);
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=gpu-mine-multi.js.map