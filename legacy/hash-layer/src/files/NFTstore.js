import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
export default class NFTstore {
    helia;
    hfs;
    async init() {
        this.helia = await createHelia();
        this.hfs = unixfs(this.helia);
    }
    async upload(svg) {
        const bytes = new TextEncoder().encode(svg);
        const cid = await this.hfs?.addBytes(bytes);
        return cid?.toString();
    }
}
//# sourceMappingURL=NFTstore.js.map