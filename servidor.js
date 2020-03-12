var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var tiempo = 0;
var usuarios = 0;
var estrellas = {};
var numEstrella = 288;

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//io.connect('http://192.168.25.40:8081',{'forceNew':true}); //Dirección para conectar en la misma red.

io.on('connection', function (socket) {

    console.log('a user connected');
    // Crea un nuevo jugador y lo agrega a nuestro objeto de jugadores.
    players[socket.id] = {
        x: Math.floor(Math.random() * 900),    //Posición aleatoria en x para su apareción.
        y: Math.floor(Math.random() *600),    //Posición aleatoria en y para su aparición.
        playerId: socket.id,
        tipoPersonaje: (Math.floor(Math.random() * 5))  //Número del personaje.
    };

    socket.emit('currentPlayers', players);// Envía el objeto de jugadores al nuevo jugador.
    
    socket.broadcast.emit('newPlayer', players[socket.id]); // Actualiza a todos los jugadores el nuevo jugador.
    
    socket.on('disconnect', function () {
        console.log('user disconnected');
        
        delete players[socket.id];  // Remueve al jugador del objeto jugadores.
        
        io.emit('disconnect', socket.id);   // Envía un mensaje a todos los jugadores para remover a este jugador.
    });

    // Cuando un jugador se mueve, actualiza la información del mismo.
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;

        // Emite un mensaje a todos los jugadores sobre el movimiento del jugador.
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    usuarios += 1;
    //Activador del reloj cuando hay la cantidad necesaria de jugadores.
    if(tiempo == 0 && usuarios == 2){
        var myInt = setInterval(function () {
            io.emit('timed',tiempo += 1);
            if (tiempo % 5 == 0){
                // Se crean 12 objetos con características que corresponderán a las de cada estrella.
                for(i = 0; i < 10; i++){
                    estrellas[numEstrella] = {
                        x: Math.floor(Math.random() * 900),
                        y: Math.floor(Math.random() * 600),
                        estrellaId: numEstrella
                    }
                    numEstrella += 1;
                }
                // Envío el array de objetos al cliente para que las genere.
                io.emit('agregaEstrellas', estrellas, numEstrella - 12);
            }
        }, 1000);
    };

    socket.on('borraEstrella',function(idEstrella){
        io.emit('eliminaEstrella', idEstrella);
    });
});

// Dejamos al servidor escuchando.
server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});