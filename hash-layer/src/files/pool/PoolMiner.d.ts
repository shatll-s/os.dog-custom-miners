import { StratumClient } from './StratumClient.js';
import BSC from '../BSC.js';
export interface PoolJobTemplate {
    height: bigint;
    previous_hash: number[];
    nonce: bigint;
    data: number[];
}
export declare class PoolMiner {
    private stratum;
    private bsc;
    private cudaHashFunction;
    private currentJob;
    private shouldStop;
    private hashrate;
    private sharesFound;
    private sharesAccepted;
    private sharesRejected;
    private miningStartTime;
    constructor(stratum: StratumClient, bsc: BSC, cudaHashFunction?: Function | null);
    private setupStratumHandlers;
    start(): Promise<void>;
    private mineJob;
    private targetToDifficulty;
    private mineJobGPU;
    private submitShare;
    stop(): void;
}
//# sourceMappingURL=PoolMiner.d.ts.map