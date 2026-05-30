import { SuiObjectResponse } from "@mysten/sui/client";
export interface ChainObject {
    fields: {
        difficulty: string;
        id: {
            id: string;
        };
        last_adjustment_time: string;
        last_block: {
            type: string;
            fields: Block;
        };
        reward: string;
    };
    type: string;
}
interface Header {
    height: bigint;
    previous_hash: Uint8Array;
    nonce: bigint;
    data: Uint8Array;
}
interface Block {
    header: {
        type: string;
        fields: Header;
    };
    block_hash: Uint8Array;
}
export default class Adapter {
    decode<T extends {
        type: string;
        fields: any;
    }>(response: SuiObjectResponse, expectedType: string): T;
}
export {};
//# sourceMappingURL=Adapter.d.ts.map