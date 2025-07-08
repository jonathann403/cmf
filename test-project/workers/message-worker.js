/**
 * Web Worker with message handling
 */

// Worker message listener
self.addEventListener('message', function(event) {
    console.log('Worker received message:', event.data);
    
    // VULNERABLE: Worker eval
    if (event.data.eval) {
        eval(event.data.eval);
    }
    
    // VULNERABLE: Dynamic import in worker
    if (event.data.import) {
        importScripts(event.data.import);
    }
    
    // Process different message types
    switch (event.data.type) {
        case 'compute':
            // Safe computation
            const result = event.data.a + event.data.b;
            self.postMessage({ type: 'result', value: result });
            break;
            
        case 'execute':
            // VULNERABLE: Code execution in worker
            try {
                const func = new Function(event.data.code);
                const result = func();
                self.postMessage({ type: 'executed', result });
            } catch (error) {
                self.postMessage({ type: 'error', message: error.message });
            }
            break;
            
        case 'load':
            // VULNERABLE: Dynamic script loading
            if (event.data.scripts) {
                event.data.scripts.forEach(script => {
                    importScripts(script);
                });
            }
            break;
    }
});

// Alternative message listener setup
self.onmessage = function(event) {
    // VULNERABLE: Direct property access
    if (event.data.workerConfig) {
        Object.assign(self, event.data.workerConfig);
    }
    
    // VULNERABLE: setTimeout with string in worker
    if (event.data.delay) {
        setTimeout(event.data.code, event.data.delay);
    }
};

// Function to handle specific message types
function handleDataMessage(data) {
    // VULNERABLE: Unsafe JSON parsing
    try {
        const parsed = JSON.parse(data.json);
        self.postMessage(parsed);
    } catch (e) {
        // VULNERABLE: Error message might contain sensitive data
        self.postMessage({ error: e.toString(), input: data.json });
    }
}

// Register additional listeners
self.addEventListener('message', function(event) {
    if (event.data.type === 'data') {
        handleDataMessage(event.data);
    }
});

// VULNERABLE: Global error handler that posts messages
self.addEventListener('error', function(error) {
    self.postMessage({
        type: 'worker-error',
        filename: error.filename,
        lineno: error.lineno,
        message: error.message,
        stack: error.error ? error.error.stack : ''
    });
});