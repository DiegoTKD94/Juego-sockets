var params = new URLSearchParams(window.location.search);

var nombre = params.get('nombre');
var sala = params.get('sala');

// referencias de jQuery
var divUsuarios = $('#divUsuarios');

function renderizarUsuarios(personas) {
    var html = '';

    html += '<li class="list-group-item active"> ' + params.get('nombre') + '</li>';

    for (var i = 0; i < personas.length; i++) {
        if (personas[i] !== socket.id) {
            html += '<li class="list-group-item"> ' + personas[i].nombre + '</li>';
        }
    }

    divUsuarios.html(html);
}