// Test file with 10 different message listener forms for MessageExtractor testing

// 1. Basic window.addEventListener - Function Declaration
// Type: addEventListener with function declaration
window.addEventListener('message', function handleMessage(event) {
    console.log('Received message:', event.data);
});

// 2. Basic window.addEventListener - Arrow Function
// Type: addEventListener with arrow function
window.addEventListener('message', (event) => {
    console.log('Arrow function handler:', event.data);
});

// 3. Basic window.addEventListener - Anonymous Function
// Type: addEventListener with anonymous function
window.addEventListener('message', function(event) {
    console.log('Anonymous function handler:', event.data);
});

// 4. window.onmessage - Function Assignment
// Type: onmessage with function assignment
window.onmessage = function(event) {
    console.log('onmessage function assignment:', event.data);
};

// 5. window.onmessage - Arrow Function Assignment
// Type: onmessage with arrow function assignment
window.onmessage = (event) => {
    console.log('onmessage arrow function:', event.data);
};

// 6. window.addEventListener - External Function Reference
// Type: addEventListener with external function reference
function externalHandler(event) {
    console.log('External handler:', event.data);
}
window.addEventListener('message', externalHandler);

// 7. window.onmessage - External Function Reference
// Type: onmessage with external function reference
const namedHandler = function(event) {
    console.log('Named handler:', event.data);
};
window.onmessage = namedHandler;

// 8. window.addEventListener - With Options Object
// Type: addEventListener with options (third parameter)
window.addEventListener('message', function(event) {
    console.log('Handler with options:', event.data);
}, { once: true, passive: true });

// 9. Conditional window.addEventListener
// Type: addEventListener within conditional block
if (typeof window !== 'undefined') {
    window.addEventListener('message', function(event) {
        console.log('Conditional handler:', event.data);
    });
}

// 10. window.onmessage - Conditional Assignment
// Type: onmessage within conditional block
if (window.onmessage === null) {
    window.onmessage = function(event) {
        console.log('Conditional onmessage:', event.data);
    };
}

// Additional edge cases for comprehensive testing:

// Non-message addEventListener (should NOT be detected)
window.addEventListener('click', function(event) {
    console.log('Click event - should not be detected');
});

// Different object addEventListener (should NOT be detected)
document.addEventListener('message', function(event) {
    console.log('Document message - should not be detected');
});

// Non-window onmessage (should NOT be detected)
const iframe = document.createElement('iframe');
iframe.onmessage = function(event) {
    console.log('Iframe onmessage - should not be detected');
};