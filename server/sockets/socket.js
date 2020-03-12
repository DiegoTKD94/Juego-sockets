const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const users = new Usuarios();

var players = {};
var tiempo = 0;
var usuarios = 0;
var estrellas = {};
var numEstrella = 288;

//io.connect('http://192.168.25.40:8081',{'forceNew':true}); //Dirección para conectar en la misma red.


io.on('connection', function(socket) {

    socket.on('entrarSala', (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        socket.join(data.sala);
        users.agregarPersona(socket.id, data.nombre, data.sala);

        socket.broadcast.to(data.sala).emit('listaPersona', users.getPersonasPorSala(data.sala));

        callback(users.getPersonasPorSala(data.sala));
    });

    console.log('a user connected');
    console.log(io.engine.clientsCount);
    // Crea un nuevo jugador y lo agrega a nuestro objeto de jugadores.
    players[socket.id] = {
        x: Math.floor(Math.random() * 900), //Posición aleatoria en x para su apareción.
        y: Math.floor(Math.random() * 600), //Posición aleatoria en y para su aparición.
        playerId: socket.id,
        tipoPersonaje: (Math.floor(Math.random() * 5)) //Número del personaje.
    };

    socket.emit('currentPlayers', players); // Envía el objeto de jugadores al nuevo jugador.

    socket.broadcast.emit('newPlayer', players[socket.id]); // Actualiza a todos los jugadores el nuevo jugador.


    // Acá va la linea del disconnect
    socket.on('disconnect', function() {
        console.log('user disconnected');
        console.log(io.engine.clientsCount);

        delete players[socket.id]; // Remueve al jugador del objeto jugadores.

        io.emit('disconnect', socket.id); // Envía un mensaje a todos los jugadores para remover a este jugador.
    });


    // Cuando un jugador se mueve, actualiza la información del mismo.
    socket.on('playerMovement', function(movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;

        // Emite un mensaje a todos los jugadores sobre el movimiento del jugador.
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    usuarios += 1;
    //Activador del reloj cuando hay la cantidad necesaria de jugadores.
    if (tiempo == 0 && usuarios == 2) {
        var myInt = setInterval(function() {
            io.emit('timed', tiempo += 1);
            if (tiempo % 5 == 0) {
                // Se crean 12 objetos con características que corresponderán a las de cada estrella.
                for (i = 0; i < 10; i++) {
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

    socket.on('borraEstrella', function(idEstrella) {
        io.emit('eliminaEstrella', idEstrella);
    });
});