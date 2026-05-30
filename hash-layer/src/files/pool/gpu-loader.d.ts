export declare function isGPUAvailable(): boolean;
export declare function getGPUCount(): number;
export interface GPUMineResult {
    found: boolean;
    nonce?: bigint;
    hash?: string;
}
export declare function mineOnGPU(height: bigint, previous_hash: number[], nonce_start: bigint, nonce_range: bigint, data: number[], difficulty: number, gpu_id?: number): GPUMineResult;
//# sourceMappingURL=gpu-loader.d.ts.map