window.addEventListener('message', function handleMessage(event) {
    eval(event.data);
});

window.addEventListener('message', x);

let x = ((event) => {eval(event.data);})