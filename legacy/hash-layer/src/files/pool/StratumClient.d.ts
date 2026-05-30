import { EventEmitter } from 'events';
export interface StratumJob {
    job_id: string;
    height: number;
    json_template: string;
    target: string;
    start_nonce: string;
    nonce_range: string;
}
export interface StratumMessage {
    id: number | string | null;
    method?: string;
    params?: any;
    result?: any;
    error?: any;
}
export declare class StratumClient extends EventEmitter {
    private host;
    private port;
    private socket;
    private buffer;
    private messageId;
    private pendingRequests;
    private connected;
    constructor(host: string, port: number);
    connect(): Promise<void>;
    private setupHandlers;
    private handleMessage;
    private send;
    subscribe(userAgent: string): Promise<any>;
    authorize(address: string, worker?: string): Promise<any>;
    submit(nonce: string, hash: string, jobId: string): Promise<any>;
    disconnect(): void;
    isConnected(): boolean;
}
//# sourceMappingURL=StratumClient.d.ts.map