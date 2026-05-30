import BSC from "./BSC.js";
import Chain from "./Chain.js";
import TXService from "./TXService.js";
export declare class GPUMiner {
    private bsc;
    private chain;
    private txService;
    private iterationsPerBatch;
    private totalHashrate;
    private blocksFound;
    constructor(bsc: BSC, chain: Chain, txService: TXService, iterationsPerBatch?: bigint);
    isAvailable(): boolean;
    private bufferToBigInt;
    private bigIntToBuffer;
    private numberToUint64;
    mineOnGPU(): Promise<void>;
    getStats(): {
        hashrate: number;
        blocksFound: number;
    };
}
//# sourceMappingURL=GPUMiner.d.ts.map