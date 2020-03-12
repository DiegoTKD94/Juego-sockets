// Requires
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
let server = http.createServer(app);
// let io = socketIO.listen(server);


const publicPath = path.resolve(__dirname, '../public');

app.use(express.static(publicPath));
const port = process.env.PORT || 3000; // agregado

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require('./sockets/socket');

// Dejamos al servidor escuchando.
server.listen(port, (err) => {
    if (err) throw new Error(err);
    console.log(`Servidor corriendo en puerto ${ port }`);
});