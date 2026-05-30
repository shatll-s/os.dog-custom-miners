import { parentPort, workerData } from 'worker_threads';
import './load-env.js';
import Miner from './Miner.js';
import Chain from './Chain.js';
import Adapter from './Adapter.js';
import BSC from './BSC.js';
import SuiClient from './SuiClient.js';
import TXService from './TXService.js';
class MinerWorker {
    miner;
    chain;
    bsc;
    tx;
    client;
    workerId;
    nonceOffset;
    totalIterations = 0;
    lastStatsTime = Date.now();
    lastIterations = 0;
    constructor() {
        this.workerId = workerData.workerId;
        this.nonceOffset = BigInt(workerData.nonceOffset);
        this.bsc = new BSC();
        this.client = new SuiClient(process.env.RPC_PROVIDER);
        const adapter = new Adapter();
        this.chain = new Chain(this.client, adapter);
        this.miner = new Miner(this.bsc, this.chain);
        this.tx = new TXService(this.client, process.env.MNEMONIC, process.env.HASH_CONTRACT);
        this.sendMessage({
            type: 'started',
            workerId: this.workerId
        });
    }
    async run() {
        while (true) {
            try {
                // Модифицируем miner для использования разных nonce
                const result = await this.mineWithOffset();
                if (result) {
                    this.sendMessage({
                        type: 'blockFound',
                        hash: result.hash,
                        nonce: result.nonce.toString()
                    });
                    // Отправляем блок
                    const tx = await this.submitBlock(result);
                    if (tx) {
                        this.sendMessage({
                            type: 'blockSubmitted',
                            digest: tx.digest,
                            status: tx.effects?.status?.status
                        });
                    }
                }
                // Отправляем статистику
                this.updateStats();
            }
            catch (err) {
                this.sendMessage({
                    type: 'error',
                    error: err?.message || String(err)
                });
                // Небольшая задержка перед повторной попыткой
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    async mineWithOffset() {
        try {
            const snapshot = await this.chain.snapshot();
            if (!snapshot)
                throw new Error("snapshot");
            const { header, block_hash } = snapshot.fields.last_block.fields;
            const { difficulty } = snapshot.fields;
            const height = BigInt(header.fields.height);
            // Используем уникальный диапазон nonce для каждого worker
            let nonce = this.nonceOffset + BigInt(Math.floor(Math.random() * 1e9));
            let iteration = 0;
            let start = Date.now();
            const reportInterval = 100000;
            while (true) {
                const hashBytes = this.bsc.getHashBytes(height + 1n, block_hash, nonce, new Uint8Array([]));
                if (this.miner.hasLeadingZeroBits(hashBytes, Number(difficulty))) {
                    return { nonce, hash: Buffer.from(hashBytes).toString("hex") };
                }
                nonce++;
                iteration++;
                this.totalIterations++;
                if (iteration % reportInterval === 0) {
                    // Проверяем не изменилась ли высота
                    const _snapshot = await this.chain.snapshot();
                    if (!_snapshot)
                        throw new Error("snapshot");
                    const { header: _header } = _snapshot.fields.last_block.fields;
                    const _height = BigInt(_header.fields.height);
                    if (height !== _height) {
                        this.sendMessage({
                            type: 'newHeight',
                            height: _height.toString()
                        });
                        return null; // Начинаем заново с новой высотой
                    }
                    // Обновляем статистику
                    this.updateStats();
                }
            }
        }
        catch (err) {
            throw err;
        }
    }
    async submitBlock(result) {
        const { nonce } = result;
        try {
            const tx = await this.tx.sumbitBlock(nonce, [], new TextEncoder().encode(process.env.NFT_URL || ""), process.env.CHAIN_OBJECT || "", process.env.BALANCE_KEEPER || "");
            // Небольшая задержка для финализации
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return tx;
        }
        catch (err) {
            if (err?.code === -32002) {
                this.sendMessage({
                    type: 'blockRejected',
                    reason: 'object conflict (race condition)'
                });
            }
            else {
                this.sendMessage({
                    type: 'error',
                    error: err?.message || String(err)
                });
            }
            return null;
        }
    }
    updateStats() {
        const now = Date.now();
        const elapsed = (now - this.lastStatsTime) / 1000;
        if (elapsed >= 5) { // Обновляем каждые 5 секунд
            const iterations = this.totalIterations - this.lastIterations;
            const hashrate = iterations / elapsed;
            this.sendMessage({
                type: 'stats',
                hashrate,
                iterations: this.totalIterations
            });
            this.lastStatsTime = now;
            this.lastIterations = this.totalIterations;
        }
    }
    sendMessage(msg) {
        if (parentPort) {
            parentPort.postMessage(msg);
        }
    }
}
// Запуск worker
const worker = new MinerWorker();
worker.run().catch(err => {
    console.error('Worker fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=MinerWorker.js.map