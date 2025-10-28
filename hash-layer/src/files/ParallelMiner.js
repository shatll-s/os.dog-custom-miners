import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class ParallelMiner {
    workers = [];
    workerStats = new Map();
    numWorkers;
    startTime = Date.now();
    totalBlocksFound = 0;
    constructor(numWorkers) {
        // По умолчанию используем количество логических ядер
        this.numWorkers = numWorkers || cpus().length;
        console.log(`🚀 Запуск ${this.numWorkers} параллельных майнеров...`);
        console.log(`💻 Обнаружено CPU: ${cpus()[0]?.model || 'Unknown'}`);
        console.log(`🧵 Потоков: ${this.numWorkers}\n`);
    }
    async start() {
        // Создаем workers
        for (let i = 0; i < this.numWorkers; i++) {
            this.createWorker(i);
        }
        // Показываем статистику каждые 10 секунд
        setInterval(() => this.printStats(), 10000);
        // Обработка graceful shutdown
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }
    createWorker(workerId) {
        const workerPath = path.join(__dirname, 'MinerWorker.js');
        const worker = new Worker(workerPath, {
            workerData: {
                workerId,
                nonceOffset: BigInt(workerId) * BigInt(1e12), // Разные диапазоны nonce
            }
        });
        // Инициализируем статистику
        this.workerStats.set(workerId, {
            workerId,
            hashrate: 0,
            iterations: 0,
            blocksFound: 0
        });
        worker.on('message', (msg) => this.handleWorkerMessage(workerId, msg));
        worker.on('error', (error) => {
            console.error(`❌ Worker ${workerId} ошибка:`, error.message);
            // Перезапускаем упавший worker
            setTimeout(() => {
                console.log(`🔄 Перезапуск worker ${workerId}...`);
                this.createWorker(workerId);
            }, 1000);
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.log(`⚠️  Worker ${workerId} завершился с кодом ${code}`);
            }
        });
        this.workers[workerId] = worker;
    }
    handleWorkerMessage(workerId, msg) {
        const stats = this.workerStats.get(workerId);
        if (!stats)
            return;
        switch (msg.type) {
            case 'stats':
                // Обновляем статистику worker
                stats.hashrate = msg.hashrate;
                stats.iterations = msg.iterations;
                break;
            case 'blockFound':
                stats.blocksFound++;
                this.totalBlocksFound++;
                console.log(`\n🎉 Worker ${workerId} нашел блок!`);
                console.log(`   Hash: ${msg.hash}`);
                console.log(`   Nonce: ${msg.nonce}`);
                break;
            case 'blockSubmitted':
                console.log(`✅ Worker ${workerId} отправил блок`);
                console.log(`   TX: ${msg.digest}`);
                console.log(`   Status: ${msg.status}\n`);
                break;
            case 'blockRejected':
                console.log(`⚠️  Worker ${workerId} блок отклонен (race condition)`);
                break;
            case 'newHeight':
                // Новая высота - можно уведомить остальных workers (опционально)
                // console.log(`📦 Новая высота: ${msg.height}`);
                break;
            case 'error':
                console.error(`❌ Worker ${workerId} ошибка:`, msg.error);
                break;
        }
    }
    printStats() {
        const totalHashrate = Array.from(this.workerStats.values())
            .reduce((sum, stats) => sum + stats.hashrate, 0);
        const totalIterations = Array.from(this.workerStats.values())
            .reduce((sum, stats) => sum + stats.iterations, 0);
        const uptime = (Date.now() - this.startTime) / 1000;
        const avgHashrate = totalIterations / uptime;
        console.log('\n═══════════════════════════════════════════════════');
        console.log(`📊 СТАТИСТИКА (uptime: ${this.formatTime(uptime)})`);
        console.log('═══════════════════════════════════════════════════');
        console.log(`⚡ Текущий хешрейт: ${this.formatHashrate(totalHashrate)}`);
        console.log(`📈 Средний хешрейт:  ${this.formatHashrate(avgHashrate)}`);
        console.log(`🔢 Всего попыток:    ${totalIterations.toLocaleString()}`);
        console.log(`🎯 Найдено блоков:   ${this.totalBlocksFound}`);
        console.log('───────────────────────────────────────────────────');
        // Детальная статистика по workers
        const sortedStats = Array.from(this.workerStats.values())
            .sort((a, b) => b.hashrate - a.hashrate);
        sortedStats.forEach(stats => {
            const percentage = totalHashrate > 0
                ? ((stats.hashrate / totalHashrate) * 100).toFixed(1)
                : '0.0';
            console.log(`Worker ${stats.workerId.toString().padStart(2)}: ` +
                `${this.formatHashrate(stats.hashrate).padEnd(12)} ` +
                `(${percentage}%) ` +
                `блоков: ${stats.blocksFound}`);
        });
        console.log('═══════════════════════════════════════════════════\n');
    }
    formatHashrate(hashrate) {
        if (hashrate > 1e6) {
            return `${(hashrate / 1e6).toFixed(2)} MH/s`;
        }
        else if (hashrate > 1e3) {
            return `${(hashrate / 1e3).toFixed(2)} KH/s`;
        }
        else {
            return `${hashrate.toFixed(2)} H/s`;
        }
    }
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }
    async shutdown() {
        console.log('\n\n🛑 Остановка майнеров...');
        // Показываем финальную статистику
        this.printStats();
        // Завершаем всех workers
        const terminationPromises = this.workers.map(worker => worker.terminate());
        await Promise.all(terminationPromises);
        console.log('✅ Все майнеры остановлены');
        process.exit(0);
    }
}
// Запуск
const numWorkers = process.argv[2] ? parseInt(process.argv[2]) : undefined;
const miner = new ParallelMiner(numWorkers);
miner.start();
//# sourceMappingURL=ParallelMiner.js.map