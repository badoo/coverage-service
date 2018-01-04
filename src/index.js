const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 9000;
const server = http.createServer(app);

function onShutdown(err) {
    server.close(() => {
        console.log('Server connection closed', err);
        process.exit(0);
    });
}
process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);

function onListening() {
    const addr = server.address();
    console.log(`HTTP server listening on port ${addr.port}`);
}
server.on('listening', onListening);

server.listen(PORT);
