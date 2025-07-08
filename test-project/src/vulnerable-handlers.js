/**
 * Collection of vulnerable message handlers for testing
 */

// Global onmessage assignment
window.onmessage = function(event) {
    // VULNERABLE: Direct DOM manipulation
    document.title = event.data;
    
    // VULNERABLE: Cookie manipulation
    document.cookie = `message=${event.data}`;
};

// Document onmessage (non-standard but sometimes used)
if (document.onmessage !== undefined) {
    document.onmessage = function(event) {
        // VULNERABLE: History manipulation
        history.pushState(null, null, event.data);
    };
}

// Function that adds message listeners dynamically
function addDynamicListener(callback) {
    window.addEventListener('message', callback);
}

// VULNERABLE: User-provided callback
addDynamicListener(function(event) {
    // VULNERABLE: Worker creation with user data
    if (event.data.worker) {
        const worker = new Worker(event.data.worker);
        worker.postMessage(event.data.workerData);
    }
});

// Nested function with message listener
function setupMessaging() {
    function innerMessageHandler(event) {
        // VULNERABLE: WebSocket creation with user data
        if (event.data.websocket) {
            const ws = new WebSocket(event.data.websocket);
            ws.onmessage = function(wsEvent) {
                document.body.innerHTML += wsEvent.data;
            };
        }
    }
    
    window.addEventListener('message', innerMessageHandler);
}

setupMessaging();

// Message listener in IIFE
(function() {
    window.addEventListener('message', function(event) {
        // VULNERABLE: XMLHttpRequest with user data
        if (event.data.xhr) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', event.data.xhr);
            xhr.onload = function() {
                document.body.innerHTML = xhr.responseText;
            };
            xhr.send();
        }
    });
})();

// Message listener with setTimeout
window.addEventListener('message', function(event) {
    // VULNERABLE: setTimeout with string (acts like eval)
    if (event.data.delay) {
        setTimeout(event.data.code, event.data.delay);
    }
});

// Message listener with setInterval
window.addEventListener('message', function(event) {
    // VULNERABLE: setInterval with string
    if (event.data.interval) {
        setInterval(event.data.code, event.data.interval);
    }
});

// Complex object with message handler
const VulnerableAPI = {
    config: {},
    
    init: function() {
        window.addEventListener('message', this.handleMessage.bind(this));
    },
    
    handleMessage: function(event) {
        // VULNERABLE: Object property manipulation
        if (event.data.config) {
            Object.assign(this.config, event.data.config);
        }
        
        // VULNERABLE: Dynamic method execution
        if (event.data.method && this[event.data.method]) {
            this[event.data.method](event.data.args);
        }
    },
    
    executeCode: function(code) {
        // VULNERABLE: eval method
        eval(code);
    }
};

VulnerableAPI.init();

// Message listener for different event types
['message', 'data'].forEach(eventType => {
    if (eventType === 'message') {
        window.addEventListener(eventType, function(event) {
            // VULNERABLE: Prototype pollution
            if (event.data.proto) {
                Object.prototype[event.data.proto.key] = event.data.proto.value;
            }
        });
    }
});