import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import SuiClient from "./SuiClient.js";
export default class TXService {
    private client;
    keypar: Ed25519Keypair;
    contractId: string;
    constructor(client: SuiClient, mnemonic: string | undefined, contractId: string | undefined);
    private createMintTx;
    private createTx;
    sumbitBlock(nonce: bigint, data: number[], imageUrl: Uint8Array, chainId: string | undefined, keeper: string | undefined): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
    mintCoins(controller: string | undefined, keeper: string | undefined): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
}
//# sourceMappingURL=TXService.d.ts.map