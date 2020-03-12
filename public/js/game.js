var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 400 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    } 
};
var platforms;
var actualEstrellas = 0;
var idcoin = null;
var estrellaEliminada = false;
var score = 0;
var scoreText;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('fondo', './assets/fondo.png');   //Carga imagen del fondo del juego.
    this.load.image('suelo', './assets/suelo.png');   //Carga imagen del suelo.
    this.load.image('base', './assets/base.png');   //Carga imagen de la base del mapa.
    //Carga la imagen de los diferentes tipos de personaje.
    this.load.spritesheet('sonic', './assets/sonic_camina.png', {frameWidth: 49.1666, frameHeight: 39});
    this.load.spritesheet('ray', './assets/ray_camina.png', {frameWidth: 49.1666, frameHeight: 40});
    this.load.spritesheet('armadillo', './assets/armadillo_camina.png', {frameWidth: 49.1666, frameHeight: 39});
    this.load.spritesheet('miles', './assets/miles_camina.png', {frameWidth: 56.6666, frameHeight: 39});
    this.load.spritesheet('knuckles', './assets/knuckles_camina.png', {frameWidth: 49.1666, frameHeight: 39});
    this.load.spritesheet('coin', 'assets/moneda_rota.png', {frameWidth: 45, frameHeight: 38}); //Carga la imagen de la estrella
}

function create() {

    this.add.image(400, 300, 'fondo');
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 690, 'base').setScale(1.5).refreshBody();
    //Creando las superficies de abajo hacia arriba.
    platforms.create(760, 590, 'suelo').setScale(0.4).refreshBody();
    platforms.create(240, 590, 'suelo').setScale(0.4).refreshBody();
    platforms.create(500, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(-20, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(1020, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(300, 480, 'suelo').setScale(0.4).refreshBody();
    platforms.create(750, 480, 'suelo').setScale(0.4).refreshBody();
    platforms.create(550, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(920, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(90, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(1030, 340, 'suelo').setScale(0.4).refreshBody();
    platforms.create(350, 340, 'suelo').setScale(0.4).refreshBody();
    platforms.create(800, 280, 'suelo').setScale(0.4).refreshBody();
    platforms.create(520, 280, 'suelo').setScale(0.4).refreshBody();
    platforms.create(190, 270, 'suelo').setScale(0.4).refreshBody();
    platforms.create(890, 220, 'suelo').setScale(0.4).refreshBody();
    
    var self = this;
    this.socket = io();
    this.enemigos = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.coins.defaults.setBounceY = 0.8; //Cantidad de rebote de las estrellas.

    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addenemigos(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addenemigos(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        self.enemigos.getChildren().forEach(function (enemigo) {
            if (playerId === enemigo.playerId) {
                enemigo.destroy();
            }
        });
    });

    this.socket.on('playerMoved', function (playerInfo) {
        self.enemigos.getChildren().forEach(function (enemigo) {
            if (playerInfo.playerId === enemigo.playerId) {
                enemigo.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.socket.on('agregaEstrellas',function (estrellas, numEstrella){
        addcoins(self, estrellas, numEstrella);
    });

    this.socket.on('eliminaEstrella',function(idEstrella){
        self.coins.getChildren().forEach(function(estrella){
            if(idEstrella === estrella.id){
                estrella.destroy();
            };
        });
    });

    // Se agregan las teclas activas.
    this.cursors = this.input.keyboard.createCursorKeys();

    // Se agrega el reloj
    text = this.add.text(20, 20, 'Tiempo: ' + formatTime(0)); // Se crea el objeto text para mostrar el tiempo en pantalla.
    scoreText = this.add.text(20, 40, 'Puntuación: 0');  //Se crea el objeto scoreText para mostrar la puntuación en pantalla.

    // Cada 1000 ms llama a onEvent
    this.socket.on('timed',function(tiempo) {
        onEvent(tiempo);
    });

    this.anims.create({
        key: 'miles_walk',
        frames: this.anims.generateFrameNumbers('miles', {start: 0, end: 12}),
        frameRate: 15,
        repeat: -1
    });
    this.anims.create({
        key: 'miles_still',
        frames: this.anims.generateFrameNumbers('miles', {start: 0, end: 0}),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'sonic_walk',
        frames: this.anims.generateFrameNumbers('sonic', {start: 0, end: 12}),
        frameRate: 15,
        repeat: -1
    });
    this.anims.create({
        key: 'sonic_still',
        frames: this.anims.generateFrameNumbers('sonic', {start: 0, end: 0}),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'knuckles_walk',
        frames: this.anims.generateFrameNumbers('knuckles', {start: 0, end: 12}),
        frameRate: 15,
        repeat: -1
    });
    this.anims.create({
        key: 'knuckles_still',
        frames: this.anims.generateFrameNumbers('knuckles', {start: 0, end: 0}),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'armadillo_walk',
        frames: this.anims.generateFrameNumbers('armadillo', {start: 0, end: 12}),
        frameRate: 15,
        repeat: -1
    });
    this.anims.create({
        key: 'armadillo_still',
        frames: this.anims.generateFrameNumbers('armadillo', {start: 0, end: 0}),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'ray_walk',
        frames: this.anims.generateFrameNumbers('ray', {start: 0, end: 12}),
        frameRate: 15,
        repeat: -1
    });
    this.anims.create({
        key: 'ray_still',
        frames: this.anims.generateFrameNumbers('ray', {start: 0, end: 0}),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'moneda_rotando',
        frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 4}),
        frameRate: 7,
        repeat: -1
    });
}

function update() {
    
    if (this.jugador) {
        // Emite el movimiento del jugador
        var x = this.jugador.x;
        var y = this.jugador.y;
        if (this.jugador.oldPosition && (x !== this.jugador.oldPosition.x || y !== this.jugador.oldPosition.y)) {
            this.socket.emit('playerMovement', { x: this.jugador.x, y: this.jugador.y});
            this.nombre.y = y - 35;
            this.nombre.x = x - 20;
        }

        // Guarda los datos de la antigua posición del jugador.
        this.jugador.oldPosition = {
            x: this.jugador.x,
            y: this.jugador.y,
        };
        // Acciones de las teclas.
        if (this.cursors.left.isDown){
            this.jugador.flipX = true;
            switch (this.jugador.texture.key){
                case 'miles':
                    this.jugador.anims.play('miles_walk', true);
                    break;
                case 'sonic':
                    this.jugador.anims.play('sonic_walk', true);
                    break;
                case 'knuckles':
                    this.jugador.anims.play('knuckles_walk', true);
                    break;
                case 'armadillo':
                    this.jugador.anims.play('armadillo_walk', true);
                    break;
                case 'ray':
                    this.jugador.anims.play('ray_walk', true);
                    break;
                default:
                    break;
            }
            
            this.jugador.setVelocityX(-160);
            
        }
            else if (this.cursors.right.isDown){
                switch (this.jugador.texture.key){
                    case 'miles':
                        this.jugador.anims.play('miles_walk', true);
                        break;
                    case 'sonic':
                        this.jugador.anims.play('sonic_walk', true);
                        break;
                    case 'knuckles':
                        this.jugador.anims.play('knuckles_walk', true);
                        break;
                    case 'armadillo':
                        this.jugador.anims.play('armadillo_walk', true);
                        break;
                    case 'ray':
                        this.jugador.anims.play('ray_walk', true);
                        break;
                    default:
                        break;
                }
                
                this.jugador.setVelocityX(160);
                this.jugador.flipX = false;
            }
            else{
                this.jugador.setVelocityX(0);
                switch (this.jugador.texture.key){
                    case 'miles':
                        this.jugador.anims.play('miles_still', true);
                        break;
                    case 'sonic':
                        this.jugador.anims.play('sonic_still', true);
                        break;
                    case 'knuckles':
                        this.jugador.anims.play('knuckles_still', true);
                        break;
                    case 'armadillo':
                        this.jugador.anims.play('armadillo_still', true);
                        break;
                    case 'ray':
                        this.jugador.anims.play('ray_still', true);
                        break;
                    default:
                        break;
                }
            }

        if (this.cursors.up.isDown && this.jugador.body.touching.down){
            this.jugador.setVelocityY(-250);
        }
        
    };

    // Revisa si los demás jugadores deben eliminar o no una estrella.
    if(getDeboEliminar()){
        setDeboEliminar(false);
        this.socket.emit('borraEstrella', getEliminarEstrella());
    }
}

// Función que maneja las particularidades iniciales de cada jugador que se crea.
function addPlayer(self, playerInfo) {
    if (playerInfo.tipoPersonaje == 0) {
        self.jugador = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'sonic');
        self.nombre = self.add.text(playerInfo.x - 20, playerInfo.y - 35, 'Sonic', {color: '#000'});
    }else if(playerInfo.tipoPersonaje == 1 ){
        self.jugador = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ray');
        self.nombre = self.add.text(playerInfo.x - 30, playerInfo.y - 35, 'Ray', {color: '#000'});
    }else if(playerInfo.tipoPersonaje == 2 ){
        self.jugador = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'armadillo');
        self.nombre = self.add.text(playerInfo.x - 50, playerInfo.y - 35, 'Armadillo', {color: '#000'});
    }else if(playerInfo.tipoPersonaje == 3 ){
        self.jugador = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'miles');
        self.nombre = self.add.text(playerInfo.x - 30, playerInfo.y - 35, 'Tiles', {color: '#000'});
    }else{
        self.jugador = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'knuckles');
        self.nombre = self.add.text(playerInfo.x - 50, playerInfo.y - 35, 'Knuckles', {color: '#000'});
    }

    self.jugador.setBounce(0.2);
    self.jugador.setCollideWorldBounds(true);
    self.physics.add.collider(self.jugador, platforms);
    self.jugador.body.setSize(18, 33, 0.5, 0.5);   //Recalcula el hitbox de la imagen.
    
}

// Función que maneja las particularidades iniciales de cada enemigo que se crea.
function addenemigos(self, playerInfo) {
    if (playerInfo.tipoPersonaje == 0) {
        self.enemigo = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'sonic');
    } else if(playerInfo.tipoPersonaje == 1 ){
        self.enemigo = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ray');
    }else if(playerInfo.tipoPersonaje == 2 ){
        self.enemigo = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'armadillo');
    }else if(playerInfo.tipoPersonaje == 3 ){
        self.enemigo = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'miles');
    }else{
        self.enemigo = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'knuckles');
    }
    self.enemigo.setCollideWorldBounds(true);
    self.physics.add.collider(self.enemigo, platforms);
    self.enemigo.playerId = playerInfo.playerId;
    self.enemigos.add(self.enemigo);
}

// Función para darle el formato al reloj.
function formatTime(seconds){
    // Minutes
    var minutes = Math.floor(seconds/60);
    // Seconds
    var partInSeconds = seconds%60;
    // Adds left zeros to seconds
    partInSeconds = partInSeconds.toString().padStart(2,'0');
    // Returns formated time
    return `${minutes}:${partInSeconds}`;
}

// Función para actualizar el tiempo del reloj.
function onEvent (tiempo){
    text.setText('Tiempo: ' + formatTime(tiempo));
}

// Función para crear estrellas en la pantalla.
function addcoins(self, estrellas, numEstrella){
    for(i = 0; i < 10; i++){
        self.estrella = self.physics.add.sprite(estrellas[numEstrella].x, estrellas[numEstrella].y, 'coin').setScale(0.6);
        numEstrella += 1;
        self.physics.add.collider(self.estrella, platforms);
        self.estrella.body.setSize(20,30,0.5,0.5);   //Recalcula el hitbox de la imagen.
        self.physics.add.overlap(self.estrella, self.jugador, collectcoin, null, this); //Evento que se genera tras una superposición de 2 objetos.
        self.estrella.id = numEstrella; //asigno una identificación a cada moneda
        self.coins.add(self.estrella);  //Agrego cada moneda al array de monedas.
        self.estrella.anims.play('moneda_rotando', true);
    };
}

//Función que te suma puntos y elimina la estrella que tocaste.
function collectcoin (coin){
    coin.disableBody(true, true);   //Elimina visualmente la estrella.
    setEliminarEstrella(coin.id);//Envío id de la estrella a eliminar de todos.
    setDeboEliminar(true);  //Envío el aviso de que se debe producir una eliminación de una estrella.

    score += 10;    //Aumento el valor de la puntuación.
    scoreText.setText('Puntuación: ' + score);
}

// Función que recibe la decisión de eliminar o no una estrella.
function setDeboEliminar(decision){
    this.estrellaEliminada = decision;
}

// Función que entrega la decisión de eliminar o no una estrella.
function getDeboEliminar(){
    return this.estrellaEliminada
}

// Función que recibe la identificación de la estrella a eliminar.
function setEliminarEstrella(idcoin){
    this.idcoin = idcoin;
}

// Función que entrega la identificación de la estrella a eliminar.
function getEliminarEstrella(){
    return this.idcoin
}