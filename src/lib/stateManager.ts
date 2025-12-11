import { PendingProductState } from '../types';
import { v4 as uuidv4 } from 'uuid';
class StateManager {
    private states = new Map<string, PendingProductState>();
    createState(data: Omit<PendingProductState, 'timestamp'>): string {
        const key = uuidv4().split('-')[0];
        this.states.set(key, { ...data, timestamp: Date.now() });
        return key;
    }
    getState(key: string) { return this.states.get(key); }
    deleteState(key: string) { this.states.delete(key); }
    constructor() { setInterval(() => { const now = Date.now(); this.states.forEach((v, k) => { if (now - v.timestamp > 600000) this.states.delete(k); }); }, 600000); }
}
export const stateManager = new StateManager();