import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import BSC from './BSC.js';
import { StratumClient } from './pool/StratumClient.js';
import { PoolMiner } from './pool/PoolMiner.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });
// Pool configuration from environment
const POOL_HOST = process.env.POOL_HOST || 'localhost';
const POOL_PORT = parseInt(process.env.POOL_PORT || '3333');
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const WORKER_NAME = process.env.WORKER_NAME || 'worker1';
// Validate required config
if (!WALLET_ADDRESS) {
    console.error('[ERROR] WALLET_ADDRESS not found in .env file!');
    console.error('        Add your wallet address: WALLET_ADDRESS=your_address_here');
    process.exit(1);
}
console.log('Hash Layer GPU Pool Miner');
console.log(`Pool: ${POOL_HOST}:${POOL_PORT}`);
console.log(`Wallet: ${WALLET_ADDRESS}`);
console.log(`Worker: ${WORKER_NAME}`);
console.log('');
async function main() {
    try {
        // Initialize components
        const bsc = new BSC();
        // Load GPU function
        let gpuMineFunction = null;
        try {
            const { isGPUAvailable, mineOnGPU, getGPUCount } = await import('./pool/gpu-loader.js');
            if (isGPUAvailable()) {
                const gpuCount = getGPUCount();
                console.log(`[GPU] Available: ${gpuCount} device(s)`);
                gpuMineFunction = mineOnGPU;
            }
            else {
                console.error('[ERROR] GPU not available!');
                process.exit(1);
            }
        }
        catch (err) {
            console.error('[ERROR] Failed to load GPU module:', err);
            process.exit(1);
        }
        // Reconnection loop
        while (true) {
            const stratum = new StratumClient(POOL_HOST, POOL_PORT);
            const miner = new PoolMiner(stratum, bsc, gpuMineFunction);
            try {
                // Connect to pool
                console.log('[POOL] Connecting...');
                await stratum.connect();
                // Subscribe to pool
                console.log('[POOL] Subscribing...');
                const subscribeResult = await stratum.subscribe('hash-layer-miner/1.0.0');
                console.log('[POOL] Subscribed:', subscribeResult);
                // Authorize worker
                console.log(`[POOL] Authorizing as ${WALLET_ADDRESS}.${WORKER_NAME}...`);
                const authResult = await stratum.authorize(WALLET_ADDRESS, WORKER_NAME);
                console.log('[POOL] Authorized:', authResult);
                // Start mining
                console.log('');
                console.log('[MINER] Starting pool mining...');
                console.log('        Press Ctrl+C to stop');
                console.log('');
                await miner.start();
            }
            catch (error) {
                console.error('[ERROR] Connection error:', error);
                stratum.disconnect();
                // Wait before reconnecting
                console.log('[POOL] Reconnecting in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    catch (error) {
        console.error('[ERROR] Fatal error:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('[MINER] Stopping...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('');
    console.log('[MINER] Stopping...');
    process.exit(0);
});
// Start the miner
main();
//# sourceMappingURL=pool-miner.js.map