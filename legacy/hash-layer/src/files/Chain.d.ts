import "./load-env.js";
import Adapter, { ChainObject } from "./Adapter.js";
import SuiClient from "./SuiClient.js";
export default class Chain {
    private suiClient;
    private adapter;
    constructor(suiClient: SuiClient, adapter: Adapter);
    snapshot(): Promise<ChainObject | null>;
}
//# sourceMappingURL=Chain.d.ts.map