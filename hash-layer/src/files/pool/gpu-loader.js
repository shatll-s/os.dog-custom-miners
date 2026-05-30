import koffi from 'koffi';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load CUDA library
const libPath = path.join(__dirname, '..', '..', 'libhashminer.so');
let cudaLib = null;
let mine_hash_layer_on_device = null;
let get_device_count = null;
try {
    cudaLib = koffi.load(libPath);
    // Define the function signatures
    mine_hash_layer_on_device = cudaLib.func('mine_hash_layer_on_device', 'int', [
        'uint64', // height
        'uint8 *', // previous_hash (32 bytes)
        'uint64', // nonce_start
        'uint32', // difficulty
        'uint64', // iterations
        'uint64 *', // result_nonce
        'uint8 *', // result_hash (32 bytes)
        'int' // gpu_id
    ]);
    get_device_count = cudaLib.func('get_device_count', 'int', []);
    console.log('[CUDA] Library loaded successfully');
}
catch (err) {
    console.log(`[WARNING] CUDA library not found at: ${libPath}`);
    console.log('          GPU mining disabled, will use CPU');
    console.log(err);
    console.log('---');
}
export function isGPUAvailable() {
    return cudaLib !== null && mine_hash_layer_on_device !== null;
}
export function getGPUCount() {
    if (!get_device_count)
        return 0;
    return get_device_count();
}
function bufferToBigInt(buffer) {
    let result = 0n;
    for (let i = 0; i < 8; i++) {
        result |= BigInt(buffer[i]) << (BigInt(i) * 8n);
    }
    return result;
}
function numberToUint64(value) {
    return value & 0xffffffffffffffffn;
}
export function mineOnGPU(height, previous_hash, nonce_start, nonce_range, data, difficulty, gpu_id = 0) {
    if (!mine_hash_layer_on_device) {
        throw new Error('CUDA library not available');
    }
    // Prepare buffers
    const previous_hash_buffer = Buffer.from(previous_hash);
    const result_nonce = Buffer.alloc(8);
    const result_hash = Buffer.alloc(32);
    // Call CUDA kernel
    const found = mine_hash_layer_on_device(numberToUint64(height), previous_hash_buffer, numberToUint64(nonce_start), difficulty, numberToUint64(nonce_range), result_nonce, result_hash, gpu_id);
    if (found) {
        const foundNonce = bufferToBigInt(result_nonce);
        const foundHash = result_hash.toString('hex');
        return {
            found: true,
            nonce: foundNonce, // Return as bigint, no conversion
            hash: foundHash
        };
    }
    return { found: false };
}
//# sourceMappingURL=gpu-loader.js.map