/**
 * Messaging utility with various message listener patterns
 */

// Classic addEventListener pattern
window.addEventListener('message', function(event) {
    console.log('Messaging module received:', event.data);
    
    // VULNERABLE: No origin validation
    if (event.data.type === 'execute') {
        eval(event.data.code);
    }
});

// Arrow function message listener
document.addEventListener('message', (event) => {
    // VULNERABLE: innerHTML manipulation
    const target = document.querySelector(event.data.selector);
    if (target) {
        target.innerHTML = event.data.content;
    }
});

// Message listener with destructuring
window.addEventListener('message', ({ data, origin, source }) => {
    // VULNERABLE: fetch with user data
    if (data.url) {
        fetch(data.url).then(response => response.text()).then(html => {
            document.body.innerHTML = html;
        });
    }
});

// Object method as message handler
const MessageHandler = {
    handleMessage: function(event) {
        // VULNERABLE: localStorage manipulation
        if (event.data.storage) {
            localStorage.setItem(event.data.storage.key, event.data.storage.value);
        }
    }
};

window.addEventListener('message', MessageHandler.handleMessage);

// Class-based message handling
class MessageProcessor {
    constructor() {
        window.addEventListener('message', this.process.bind(this));
    }
    
    process(event) {
        // VULNERABLE: Dynamic script loading
        if (event.data.script) {
            const script = document.createElement('script');
            script.src = event.data.script;
            document.head.appendChild(script);
        }
    }
}

new MessageProcessor();

// Conditional message listener
if (window.parent !== window) {
    window.addEventListener('message', function(event) {
        // VULNERABLE: postMessage relay without validation
        window.parent.postMessage(event.data, '*');
    });
}

// Message listener with try-catch
window.addEventListener('message', function(event) {
    try {
        // VULNERABLE: JSON.parse without validation
        const parsed = JSON.parse(event.data);
        if (parsed.action === 'navigate') {
            window.location.href = parsed.url;
        }
    } catch (e) {
        console.error('Failed to parse message:', e);
    }
});