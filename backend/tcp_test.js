const net = require('net');
const port = 7070;
const host = '127.0.0.1';

const encoder = new TextEncoder();
const msgHeaderLengthBytes = 4; // Int32

const server = net.createServer();
server.listen(port,  () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to all the connected, the client will receive it as data from the server
        //sockets.forEach(function(sock, index, array) {
        /*    let reply = sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n';
            let header = reply.length;
            
            let buffer = new ArrayBuffer(msgHeaderLengthBytes + reply.length);
            let headerView = new DataView(buffer, 0, 4);
            let msgView = new Uint8Array(buffer, 4, reply.length);

            headerView.setInt32(0,reply.length,true); //true for little endian enforcement
            msgView.set(encoder.encode(reply), 0);

            let socketWriteView = new Uint8Array(buffer);*/
            sock.write(encodeStringMessage("Echo "+data)); 
        //});
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
}); 

function encodeStringMessage(msg){
   
    let header = msg.length;

    let buffer = new ArrayBuffer(msgHeaderLengthBytes + msg.length);
    let headerView = new DataView(buffer, 0, 4);
    let msgView = new Uint8Array(buffer, 4, msg.length);

    headerView.setInt32(0, msg.length, true);
    msgView.set(encoder.encode(msg), 0);

    let socketWriteView = new Uint8Array(buffer);
    return socketWriteView;
}
