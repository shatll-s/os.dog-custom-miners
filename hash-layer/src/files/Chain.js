import "./load-env.js";
export default class Chain {
    suiClient;
    adapter;
    constructor(suiClient, adapter) {
        this.suiClient = suiClient;
        this.adapter = adapter;
    }
    async snapshot() {
        if (!process.env.CHAIN_OBJECT || !process.env.CHAIN_OBJECT_TYPE)
            return null;
        try {
            const response = await this.suiClient.getObject(process.env.CHAIN_OBJECT);
            if (!response)
                throw new Error("no have obj");
            return this.adapter.decode(response, process.env.CHAIN_OBJECT_TYPE);
        }
        catch (err) {
            throw err;
        }
    }
}
//# sourceMappingURL=Chain.js.map