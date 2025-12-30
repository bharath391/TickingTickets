const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
    console.log('Client: Connected');
    ws.send('Hello server from script');
    setTimeout(() => {
        console.log('Client: Closing connection');
        ws.close();
    }, 1000);
});
