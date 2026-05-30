import './load-env.js';
import SuiClient from "./SuiClient.js";
import TXService from "./TXService.js";
class Mint {
    client;
    tx;
    constructor() {
        this.client = new SuiClient(process.env.RPC_PROVIDER);
        this.tx = new TXService(this.client, process.env.MNEMONIC, process.env.HASH_CONTRACT);
    }
    async run() {
        try {
            const result = await this.tx.mintCoins(process.env.MINING_CONTROLLER, process.env.BALANCE_KEEPER);
            console.log(result);
        }
        catch (err) {
            console.log(err);
        }
    }
}
const hash = new Mint();
hash.run();
//# sourceMappingURL=Mint.js.map