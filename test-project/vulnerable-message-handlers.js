// Test file with vulnerable message handlers for sink detection

// 1. Handler with eval() sink
window.addEventListener('message', function(event) {
    console.log('Received:', event.data);
    eval(event.data.code); // HIGH SEVERITY: Direct eval call
});

// 2. Handler with document.write() sink
window.onmessage = function(event) {
    document.write(event.data.html); // HIGH SEVERITY: XSS via document.write
};

// 3. Handler with innerHTML sink
window.addEventListener('message', (event) => {
    const container = document.getElementById('content');
    container.innerHTML = event.data.content; // MEDIUM SEVERITY: XSS via innerHTML
});

// 4. Handler with multiple sinks
window.onmessage = function(event) {
    if (event.data.type === 'script') {
        eval(event.data.payload); // HIGH SEVERITY: eval
    } else if (event.data.type === 'html') {
        document.getElementById('target').innerHTML = event.data.payload; // MEDIUM SEVERITY: innerHTML
        document.write('<div>' + event.data.extra + '</div>'); // HIGH SEVERITY: document.write
    }
};

// 5. Handler with outerHTML sink
window.addEventListener('message', function(event) {
    const element = document.querySelector('.dynamic');
    element.outerHTML = event.data.replacement; // MEDIUM SEVERITY: XSS via outerHTML
});

// 6. Handler with document.writeln() sink
window.onmessage = (event) => {
    document.writeln(event.data.line); // HIGH SEVERITY: XSS via document.writeln
};

// 7. Safe handler (no sinks)
window.addEventListener('message', function(event) {
    console.log('Safe handling:', event.data);
    const sanitized = event.data.message.replace(/[<>]/g, '');
    document.getElementById('safe').textContent = sanitized;
});

// 8. Handler with conditional sinks
window.onmessage = function(event) {
    if (event.data.trusted) {
        eval('console.log("trusted code")'); // HIGH SEVERITY: eval in conditional
    }
    
    const target = document.getElementById('output');
    if (target) {
        target.innerHTML = event.data.safe_content; // MEDIUM SEVERITY: innerHTML
    }
};