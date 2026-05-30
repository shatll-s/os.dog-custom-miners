import chalk from 'chalk';
function timestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return chalk.gray(`[${hours}:${minutes}:${seconds}]`);
}
function printHashrateTable(hashrate, accepted, found, uptime) {
    const hashrateStr = (hashrate / 1_000_000).toFixed(2);
    const acceptRate = found > 0 ? ((accepted / found) * 100).toFixed(1) : '0.0';
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeStr = `${hours}h ${minutes}m`;
    console.log(chalk.cyan('┌────────────────────────────────────────────────────────┐'));
    console.log(chalk.cyan('│') + chalk.cyan.bold('  Mining Statistics'.padEnd(55)) + chalk.cyan('│'));
    console.log(chalk.cyan('├────────────────────────────────────────────────────────┤'));
    console.log(chalk.cyan('│') + `  Hashrate:        ${chalk.cyan.bold(hashrateStr.padStart(8))} MH/s`.padEnd(64) + chalk.cyan('│'));
    console.log(chalk.cyan('│') + `  Shares:          ${chalk.green(accepted.toString().padStart(4))} / ${found.toString().padEnd(4)} (${chalk.yellow(acceptRate + '%')})`.padEnd(75) + chalk.cyan('│'));
    console.log(chalk.cyan('│') + `  Uptime:          ${chalk.white(uptimeStr.padEnd(8))}`.padEnd(64) + chalk.cyan('│'));
    console.log(chalk.cyan('└────────────────────────────────────────────────────────┘'));
}
export class PoolMiner {
    stratum;
    bsc;
    cudaHashFunction;
    currentJob = null;
    shouldStop = false;
    hashrate = 0;
    sharesFound = 0;
    sharesAccepted = 0;
    sharesRejected = 0;
    miningStartTime = Date.now();
    constructor(stratum, bsc, cudaHashFunction = null) {
        this.stratum = stratum;
        this.bsc = bsc;
        this.cudaHashFunction = cudaHashFunction;
        this.setupStratumHandlers();
    }
    setupStratumHandlers() {
        this.stratum.on('job', (job) => {
            console.log(`${timestamp()} [POOL] Received new job: ${job.job_id} | height: ${job.height}`);
            this.currentJob = job;
            this.shouldStop = true; // Stop current mining and start new job
        });
        this.stratum.on('disconnect', () => {
            console.log(`${timestamp()} [POOL] Disconnected`);
            this.currentJob = null;
            this.shouldStop = true; // Stop mining immediately on disconnect
        });
    }
    async start() {
        let lastJobId = null;
        while (this.stratum.isConnected()) {
            if (!this.currentJob) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }
            // Only mine if it's a new job
            if (this.currentJob.job_id === lastJobId) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }
            lastJobId = this.currentJob.job_id;
            this.shouldStop = false;
            await this.mineJob(this.currentJob);
        }
    }
    async mineJob(job) {
        try {
            // Parse JSON template
            const template = JSON.parse(job.json_template);
            const height = BigInt(template.height);
            const previous_hash = new Uint8Array(template.previous_hash);
            const data = new Uint8Array(template.data || []);
            // Parse target
            const targetBigInt = BigInt('0x' + job.target);
            console.log(`${timestamp()} [MINER] Started mining job ${job.job_id} (height: ${height})`);
            // Use GPU
            if (!this.cudaHashFunction) {
                console.error(`${timestamp()} [ERROR] GPU not available!`);
                return;
            }
            await this.mineJobGPU(job, template, height, previous_hash, data, targetBigInt);
        }
        catch (err) {
            console.error(`${timestamp()} [ERROR] Error mining job:`, err);
        }
    }
    targetToDifficulty(targetHex) {
        // Convert target to approximate difficulty in bits for GPU
        const target = BigInt('0x' + targetHex);
        // Count leading zero bits
        let bits = 0;
        for (let i = 255; i >= 0; i--) {
            if ((target >> BigInt(i)) & 1n) {
                bits = 255 - i;
                break;
            }
        }
        return bits;
    }
    async mineJobGPU(job, template, height, previous_hash, data, target) {
        if (!this.cudaHashFunction)
            return;
        // Convert target to difficulty bits for GPU
        const difficulty = this.targetToDifficulty(job.target);
        // Parse hex strings to BigInt
        const startNonce = BigInt(job.start_nonce);
        const nonceRange = BigInt(job.nonce_range);
        const maxNonce = startNonce + nonceRange;
        // Keep track of nonces we've already tried
        let currentNonce = startNonce;
        const submittedNonces = new Set();
        // Optimize batch size based on difficulty
        // Higher difficulty = larger batches (less kernel launch overhead)
        let chunkSize = 500000000n; // 500M base
        if (difficulty >= 30) {
            chunkSize = 2000000000n; // 2B for high difficulty
        }
        else if (difficulty >= 20) {
            chunkSize = 1000000000n; // 1B for medium difficulty
        }
        const startTime = Date.now();
        let totalHashes = 0n;
        let lastReportTime = Date.now();
        while (currentNonce < maxNonce && !this.shouldStop && this.stratum.isConnected()) {
            const remainingRange = maxNonce - currentNonce;
            const batchSize = remainingRange < chunkSize ? remainingRange : chunkSize;
            try {
                const result = await this.cudaHashFunction(height, Array.from(previous_hash), currentNonce, batchSize, Array.from(data), difficulty);
                totalHashes += batchSize;
                if (result && result.found && this.stratum.isConnected()) {
                    // Verify with exact target (GPU uses approximate difficulty)
                    const hashBigInt = BigInt('0x' + result.hash);
                    if (hashBigInt <= target) {
                        // Check if we already submitted this nonce
                        const nonceHex = '0x' + result.nonce.toString(16);
                        if (!submittedNonces.has(nonceHex)) {
                            this.sharesFound++;
                            submittedNonces.add(nonceHex);
                            await this.submitShare(nonceHex, result.hash, job.job_id);
                        }
                    }
                }
                // Report hashrate every 5 seconds
                const now = Date.now();
                if (now - lastReportTime >= 5000) {
                    const elapsed = (now - startTime) / 1000;
                    const hashrate = Number(totalHashes) / elapsed;
                    const uptime = (now - this.miningStartTime) / 1000;
                    console.log(''); // Empty line before table
                    printHashrateTable(hashrate, this.sharesAccepted, this.sharesFound, uptime);
                    console.log(''); // Empty line after table
                    lastReportTime = now;
                }
                // Move to next batch
                currentNonce += batchSize;
            }
            catch (err) {
                console.error('[ERROR] GPU mining error:', err);
                break;
            }
        }
    }
    async submitShare(nonce, hash, jobId) {
        try {
            const result = await this.stratum.submit(nonce, hash, jobId);
            if (result) {
                this.sharesAccepted++;
                console.log(`${timestamp()} [SHARE] Accepted: ${hash.substring(0, 16)}... (${this.sharesAccepted}/${this.sharesFound})`);
            }
        }
        catch (err) {
            this.sharesRejected++;
            console.error(`${timestamp()} [SHARE] Rejected: ${err.message || err}`);
        }
    }
    stop() {
        this.shouldStop = true;
    }
}
//# sourceMappingURL=PoolMiner.js.map