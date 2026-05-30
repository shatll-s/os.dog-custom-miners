import { SuiClient as Client } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Signer } from "@mysten/sui/cryptography";
export declare class SuiClient {
    client: Client;
    constructor(url: string | undefined);
    getObject(objectId: string): Promise<import("@mysten/sui/client").SuiObjectResponse>;
    getBalance(address: string): Promise<import("@mysten/sui/client").CoinBalance>;
    getOwnedObjects(address: string): Promise<import("@mysten/sui/client").PaginatedObjectsResponse>;
    executeTransaction(transaction: Transaction, signer: Signer): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
}
export default SuiClient;
//# sourceMappingURL=SuiClient.d.ts.map