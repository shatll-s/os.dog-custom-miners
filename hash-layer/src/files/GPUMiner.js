import koffi from "koffi";
import path from "path";
import { fileURLToPath } from "url";
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, "..", "libhashminer.so");
let cudaLib = null;
let mine_hash_layer = null;
try {
    cudaLib = koffi.load(libPath);
    // Define the function signature
    mine_hash_layer = cudaLib.func("mine_hash_layer", "int", [
        "uint64", // height
        "uint8 *", // previous_hash (32 bytes)
        "uint64", // nonce_start
        "uint32", // difficulty
        "uint64", // iterations
        "uint64 *", // result_nonce
        "uint8 *" // result_hash (32 bytes)
    ]);
    console.log("✅ CUDA library loaded successfully");
}
catch (err) {
    console.error("❌ Failed to load CUDA library:", err);
    console.log(`Expected library at: ${libPath}`);
    console.log("Please run 'make' to compile the CUDA code first");
}
export class GPUMiner {
    bsc;
    chain;
    txService;
    iterationsPerBatch;
    totalHashrate = 0;
    blocksFound = 0;
    constructor(bsc, chain, txService, iterationsPerBatch = 1000000000n // 1B iterations per batch (1 миллиард)
    ) {
        this.bsc = bsc;
        this.chain = chain;
        this.txService = txService;
        this.iterationsPerBatch = iterationsPerBatch;
    }
    isAvailable() {
        return cudaLib !== null && mine_hash_layer !== null;
    }
    bufferToBigInt(buffer) {
        let result = 0n;
        for (let i = 0; i < 8; i++) {
            result |= BigInt(buffer[i]) << (BigInt(i) * 8n);
        }
        return result;
    }
    bigIntToBuffer(value) {
        const buffer = Buffer.alloc(8);
        for (let i = 0; i < 8; i++) {
            buffer[i] = Number((value >> (BigInt(i) * 8n)) & 0xffn);
        }
        return buffer;
    }
    numberToUint64(value) {
        // Ensure value fits in uint64
        return value & 0xffffffffffffffffn;
    }
    async mineOnGPU() {
        if (!mine_hash_layer) {
            throw new Error("CUDA library not available");
        }
        console.log("🚀 Starting GPU mining...");
        while (true) {
            try {
                // Get chain snapshot
                const snapshot = await this.chain.snapshot();
                if (!snapshot) {
                    console.error("❌ Failed to get chain snapshot");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    continue;
                }
                const { header, block_hash } = snapshot.fields.last_block.fields;
                const { difficulty } = snapshot.fields;
                const height = BigInt(header.fields.height);
                const startTime = Date.now();
                // Prepare buffers
                const previous_hash = Buffer.from(block_hash);
                const result_nonce = Buffer.alloc(8);
                const result_hash = Buffer.alloc(32);
                // Random starting nonce
                const nonce_start = BigInt(Math.floor(Math.random() * 1e15));
                // Call CUDA kernel
                const found = mine_hash_layer(this.numberToUint64(height + 1n), previous_hash, this.numberToUint64(nonce_start), Number(difficulty), this.numberToUint64(this.iterationsPerBatch), result_nonce, result_hash);
                const elapsed = (Date.now() - startTime) / 1000;
                const hashrate = Number(this.iterationsPerBatch) / elapsed;
                this.totalHashrate = hashrate;
                console.log(`⚡ Текущий хешрейт: ${(hashrate / 1_000_000).toFixed(2)} MH/s (блок: ${height})`);
                if (found) {
                    const foundNonce = this.bufferToBigInt(result_nonce);
                    const foundHash = result_hash.toString("hex");
                    console.log(`🎯 БЛОК НАЙДЕН!`);
                    console.log(`   Nonce: ${foundNonce}`);
                    console.log(`   Hash: ${foundHash}`);
                    console.log(`   Difficulty: ${difficulty} bits`);
                    try {
                        await this.txService.sumbitBlock(foundNonce, [], new TextEncoder().encode(process.env.NFT_URL || ""), process.env.CHAIN_OBJECT || "", process.env.BALANCE_KEEPER || "");
                        this.blocksFound++;
                        console.log(`✅ Блок отправлен! Всего найдено: ${this.blocksFound}`);
                    }
                    catch (err) {
                        if (err?.code === -32002) {
                            console.warn("❌ Отклонено валидаторами (конфликт объекта)");
                        }
                        else {
                            console.error("❌ Ошибка отправки блока:", err);
                        }
                    }
                    // Wait a bit for chain to update
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
            catch (err) {
                console.error("❌ Ошибка майнинга:", err);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    getStats() {
        return {
            hashrate: this.totalHashrate,
            blocksFound: this.blocksFound,
        };
    }
}
//# sourceMappingURL=GPUMiner.js.map