import { ChainObject } from "./Adapter.js";
import BSC from "./BSC.js";
import Chain from "./Chain.js";
declare class Miner {
    private bsc;
    private chain;
    snapshot: ChainObject | null;
    constructor(bsc: BSC, chain: Chain);
    hasLeadingZeroBits(hash: Uint8Array, bits: number): boolean;
    start(): Promise<{
        nonce: bigint;
        hash: string;
    } | null>;
}
export default Miner;
//# sourceMappingURL=Miner.d.ts.map