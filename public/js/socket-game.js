var socket = io();
var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    throw new Error('El nombre y sala son necesarios');
}

var jugador = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
};

document.getElementById('userDisplay').innerHTML = jugador.nombre;

socket.on('connect', function() {
    console.log('Conectado al servidor');
    socket.emit('entrarSala', jugador, function(resp) {
        renderizarUsuarios(resp);
    });
});

socket.on('listaPersona', function(personas) {
    renderizarUsuarios(personas);
});