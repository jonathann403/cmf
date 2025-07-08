/**
 * TypeScript utility for cross-window communication
 */

interface MessagePayload {
    action: string;
    data: any;
    sender: string;
}

class CommunicationManager {
    private messageHandlers: Map<string, Function> = new Map();

    constructor() {
        this.setupMessageListeners();
    }

    private setupMessageListeners(): void {
        // TypeScript message listener
        window.addEventListener('message', (event: MessageEvent) => {
            // VULNERABLE: No origin validation in TypeScript
            this.processMessage(event.data, event.origin);
        });

        // Alternative listener setup
        document.addEventListener('message', this.handleDocumentMessage.bind(this));
        
        // Window onmessage assignment
        window.onmessage = (event: MessageEvent) => {
            // VULNERABLE: Dynamic code execution
            if (event.data.typescript) {
                eval(event.data.typescript);
            }
        };
    }

    private handleDocumentMessage(event: MessageEvent): void {
        // VULNERABLE: Type assertion without validation
        const payload = event.data as MessagePayload;
        
        // VULNERABLE: Dynamic handler execution
        const handler = this.messageHandlers.get(payload.action);
        if (handler) {
            handler(payload.data);
        }
    }

    private processMessage(data: any, origin: string): void {
        // VULNERABLE: No input validation
        console.log(`Processing message from ${origin}:`, data);
        
        // VULNERABLE: Object property access without validation
        if (data.config) {
            Object.assign(this, data.config);
        }

        // VULNERABLE: Function call with user data
        if (data.method && typeof this[data.method as keyof this] === 'function') {
            (this[data.method as keyof this] as Function)(data.args);
        }
    }

    public registerHandler(action: string, handler: Function): void {
        this.messageHandlers.set(action, handler);
    }

    // VULNERABLE: Method that can be called via messages
    public executeScript(script: string): void {
        eval(script);
    }

    // VULNERABLE: DOM manipulation method
    public updateDOM(selector: string, content: string): void {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
        }
    }
}

// Export patterns that might be vulnerable
export const communicationManager = new CommunicationManager();

// Function-based message handling
export function addMessageListener(callback: (event: MessageEvent) => void): void {
    window.addEventListener('message', callback);
}

// VULNERABLE: Global message handler
export function handleGlobalMessage(event: MessageEvent): void {
    // VULNERABLE: No validation
    if (event.data.globalAction) {
        switch (event.data.globalAction) {
            case 'navigate':
                window.location.href = event.data.url;
                break;
            case 'reload':
                window.location.reload();
                break;
            case 'execute':
                new Function(event.data.code)();
                break;
        }
    }
}

// Register global handler
window.addEventListener('message', handleGlobalMessage);

// Advanced TypeScript patterns
type MessageHandler<T = any> = (data: T, origin: string) => void;

export class TypedMessageManager<T extends Record<string, any>> {
    private handlers: Partial<{ [K in keyof T]: MessageHandler<T[K]> }> = {};

    constructor() {
        // VULNERABLE: Generic message listener
        window.addEventListener('message', (event: MessageEvent) => {
            const { type, data } = event.data;
            const handler = this.handlers[type as keyof T];
            
            // VULNERABLE: Handler execution without validation
            if (handler) {
                handler(data, event.origin);
            }
        });
    }

    public on<K extends keyof T>(type: K, handler: MessageHandler<T[K]>): void {
        this.handlers[type] = handler;
    }
}