import net from 'net';
import { EventEmitter } from 'events';
export class StratumClient extends EventEmitter {
    host;
    port;
    socket = null;
    buffer = '';
    messageId = 0;
    pendingRequests = new Map();
    connected = false;
    constructor(host, port) {
        super();
        this.host = host;
        this.port = port;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.connect({ host: this.host, port: this.port });
            this.socket.setEncoding('utf8');
            this.socket.on('connect', () => {
                console.log(`[POOL] Connected to ${this.host}:${this.port}`);
                this.connected = true;
                this.setupHandlers();
                resolve();
            });
            this.socket.on('error', (err) => {
                console.error('[ERROR] Socket error:', err);
                this.connected = false;
                reject(err);
            });
            this.socket.on('close', () => {
                console.log('[POOL] Disconnected');
                this.connected = false;
                this.emit('disconnect');
            });
            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }
    setupHandlers() {
        if (!this.socket)
            return;
        this.socket.on('data', (data) => {
            this.buffer += data;
            const lines = this.buffer.split('\n');
            this.buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const message = JSON.parse(line.trim());
                        this.handleMessage(message);
                    }
                    catch (err) {
                        console.error('Failed to parse message:', line, err);
                    }
                }
            }
        });
    }
    handleMessage(message) {
        // Handle notifications (method with null id)
        if (message.method) {
            switch (message.method) {
                case 'job':
                    this.emit('job', message.params);
                    break;
                default:
                    console.log('Unknown notification:', message.method);
            }
            return;
        }
        // Handle responses to our requests
        if (message.id !== null && message.id !== undefined) {
            const pending = this.pendingRequests.get(Number(message.id));
            if (pending) {
                this.pendingRequests.delete(Number(message.id));
                if (message.error) {
                    pending.reject(message.error);
                }
                else {
                    // Check if result contains a job (from authorize)
                    if (message.result && message.result.job) {
                        this.emit('job', message.result.job);
                    }
                    pending.resolve(message.result);
                }
            }
        }
    }
    send(method, params) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.connected) {
                return reject(new Error('Not connected'));
            }
            const id = ++this.messageId;
            const message = { id, method, params };
            this.pendingRequests.set(id, { resolve, reject });
            const json = JSON.stringify(message) + '\n';
            this.socket.write(json, (err) => {
                if (err) {
                    this.pendingRequests.delete(id);
                    reject(err);
                }
            });
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
    async subscribe(userAgent) {
        return this.send('mining.subscribe', [userAgent]);
    }
    async authorize(address, worker = 'default') {
        const login = `${address}.${worker}`;
        return this.send('mining.authorize', [login, 'x']);
    }
    async submit(nonce, hash, jobId) {
        return this.send('mining.submit', {
            nonce, // hex string
            result: hash,
            job_id: jobId
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.connected = false;
    }
    isConnected() {
        return this.connected;
    }
}
//# sourceMappingURL=StratumClient.js.map