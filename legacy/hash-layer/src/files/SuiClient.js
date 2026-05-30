import { SuiClient as Client, SuiHTTPTransport } from "@mysten/sui/client";
export class SuiClient {
    client;
    constructor(url) {
        if (!url)
            throw new Error("url is req");
        this.client = new Client({
            transport: new SuiHTTPTransport({
                url,
            }),
        });
    }
    // Получить информацию об объекте
    async getObject(objectId) {
        return await this.client.getObject({
            id: objectId,
            options: {
                showType: true,
                showOwner: true,
                showContent: true,
            },
        });
    }
    // Получить баланс кошелька
    async getBalance(address) {
        return await this.client.getBalance({
            owner: address,
        });
    }
    // Получить все объекты кошелька
    async getOwnedObjects(address) {
        return await this.client.getOwnedObjects({
            owner: address,
        });
    }
    // Выполнить транзакцию
    async executeTransaction(transaction, signer) {
        return this.client.signAndExecuteTransaction({
            transaction,
            signer,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
    }
}
export default SuiClient;
//# sourceMappingURL=SuiClient.js.map