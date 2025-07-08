/**
 * Examples of secure message handlers (for contrast)
 */

// Secure message handler with origin validation
window.addEventListener('message', function(event) {
    // SECURE: Origin validation
    const allowedOrigins = ['https://example.com', 'https://trusted-site.com'];
    if (!allowedOrigins.includes(event.origin)) {
        console.warn('Message from untrusted origin:', event.origin);
        return;
    }
    
    // SECURE: Data validation
    if (typeof event.data !== 'object' || !event.data.type) {
        console.warn('Invalid message format');
        return;
    }
    
    // SECURE: Safe DOM manipulation
    const safeElement = document.createElement('div');
    safeElement.textContent = event.data.message; // textContent instead of innerHTML
    document.getElementById('safe-container').appendChild(safeElement);
});

// Secure message handler with CSP compliance
document.addEventListener('message', function(event) {
    // SECURE: Strict origin check
    if (event.origin !== window.location.origin) {
        return;
    }
    
    // SECURE: Whitelist of allowed actions
    const allowedActions = ['updateStatus', 'showNotification'];
    if (!allowedActions.includes(event.data.action)) {
        return;
    }
    
    // SECURE: Safe action handling
    switch (event.data.action) {
        case 'updateStatus':
            document.getElementById('status').textContent = 
                String(event.data.status).substring(0, 50); // Length limit
            break;
        case 'showNotification':
            // Use safe notification API instead of DOM manipulation
            if ('Notification' in window) {
                new Notification(String(event.data.message).substring(0, 100));
            }
            break;
    }
});

// Secure worker communication
const SecureWorkerManager = {
    allowedWorkers: ['utils/calculator.js', 'utils/formatter.js'],
    
    init: function() {
        window.addEventListener('message', this.handleWorkerRequest.bind(this));
    },
    
    handleWorkerRequest: function(event) {
        // SECURE: Origin and structure validation
        if (event.origin !== window.location.origin || 
            !event.data.workerScript || 
            !this.allowedWorkers.includes(event.data.workerScript)) {
            return;
        }
        
        // SECURE: Safe worker creation
        try {
            const worker = new Worker(event.data.workerScript);
            worker.postMessage(this.sanitizeWorkerData(event.data.payload));
        } catch (error) {
            console.error('Failed to create worker:', error);
        }
    },
    
    sanitizeWorkerData: function(data) {
        // SECURE: Data sanitization
        if (typeof data !== 'object') return {};
        
        return {
            operation: String(data.operation || '').substring(0, 20),
            value: Number(data.value) || 0
        };
    }
};

SecureWorkerManager.init();