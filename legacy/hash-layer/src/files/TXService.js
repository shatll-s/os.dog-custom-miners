import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
export default class TXService {
    client;
    keypar;
    contractId;
    constructor(client, mnemonic, contractId) {
        this.client = client;
        if (!mnemonic)
            throw new Error("Mnemonic is required for Submitter");
        if (!contractId)
            throw new Error("ContractId is required for Submitter");
        this.keypar = Ed25519Keypair.deriveKeypair(mnemonic, "m/44'/784'/0'/0'/0'");
        this.contractId = contractId;
    }
    createMintTx(controller, keeper) {
        const tx = new Transaction();
        tx.moveCall({
            target: `${this.contractId}::hash_layer::mint`,
            arguments: [tx.object(controller), tx.object(keeper)],
        });
        tx.setGasPrice(1000);
        tx.setGasBudget(3500000);
        return tx;
    }
    createTx(nonce, data, imageUrl, chainId, keeper) {
        const tx = new Transaction();
        tx.moveCall({
            target: `${this.contractId}::hash_layer::create_block`,
            arguments: [
                tx.pure.u64(nonce),
                tx.pure.vector("u8", data), // <vector<u8>>
                tx.pure.vector("u8", imageUrl), // vector<u8>
                tx.object(chainId),
                tx.object.clock(),
                tx.object(keeper),
            ],
        });
        tx.setGasPrice(1000);
        tx.setGasBudget(3500000);
        return tx;
    }
    async sumbitBlock(nonce, data, imageUrl, chainId, keeper) {
        if (!imageUrl)
            throw new Error("imageUrl is required");
        if (!chainId)
            throw new Error("chainId is required");
        if (!keeper)
            throw new Error("keeper is required");
        try {
            const tx = this.createTx(nonce, data, imageUrl, chainId, keeper);
            const result = await this.client.executeTransaction(tx, this.keypar);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    async mintCoins(controller, keeper) {
        if (!controller)
            throw new Error("imageUrl is required");
        if (!keeper)
            throw new Error("keeper is required");
        try {
            const tx = this.createMintTx(controller, keeper);
            const result = await this.client.executeTransaction(tx, this.keypar);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
}
//# sourceMappingURL=TXService.js.map