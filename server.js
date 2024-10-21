const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require("socket.io")

const rooms = {}
let roomId = 100;

/*

  {
    "room1": [socketId1, socketId2],
    "room2": [socketId3, socketId4],
    "room3": [socketId5, socketId6]
  }

 */

// P1 Unity player
// P2 Web player

// maybe handle user disconnect
// ideas for client
//  deviceId = generateUniqueId(); // Implement this function
//     localStorage.setItem('deviceId', deviceId);
// or store ip address

// create room for P1
// create room and put in rooms list and sockets join list

// P2 join
// verif if room name given by J2 is in rooms if yes include P2 in room, if no return message room not exist
// once J2 join io.emit to room start game (allowing unity to run game, web to move to gameplay page)

// J1 et J2 finissent la partie ou la quitte
// remove from rooms et socket lists et suppr

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    }
});


/*
 renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne;
 */
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/*
 recherche les différentes erreurs et les gère de manière appropriée.
 Elle est ensuite enregistrée dans le serveur
 */
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

io.on('connection', (socket) => {
    console.log('User connected from:', socket.id);

    socket.on('test message', (message) => {
        console.log('message: ', message.content ," from: ", socket.id);
        io.emit('test message', 'test message from server');
    });

    socket.on('socket', () => {
        const ipAddress = socket.handshake.address;
        console.log(socket.handshake)
        io.emit('socket', ipAddress);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

    socket.on('init game', () => {
        // add in rooms object
        const hostSocketId = socket.id;

        const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(hostSocketId));

        if (!isClientAlreadyInRoom) {
            // add in socket room
            socket.join(roomId)

            rooms[roomId] = [hostSocketId]
            io.emit('new room', rooms);
            roomId++
            console.log("init game", rooms)

        }

    })

    socket.on('join game', (roomNumber) => {

        // property socket.rooms -> list rooms for the socket in an objects, by default socket is in a room -> ex: Set(2) { 'nyBeoS4V7eVHYPpcAAAF', 'room1' }

        const guestIdAddress = socket.id;

        const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(guestIdAddress));
        const doesRoomExist = Object.keys(rooms).some(room => room == roomNumber);

        console.log("join game", rooms)

        if (!doesRoomExist) {
            socket.emit('room does not exist');
            console.log('Room does not exist');
        } else if (isClientAlreadyInRoom) {
            socket.emit('already in room');
            console.log('User is already in the room');
        } else if (rooms[roomNumber].length >= 2) {
            socket.emit('full room');
            console.log('Room is full');
        } else {
            console.log('Room exists and is not full. User can enter.');
            socket.join(roomNumber);
            rooms[roomNumber].push(socket.id);
            io.emit('join room', rooms);
        }

    })

    socket.on('send room', () => {
        socket.to("room1").emit("event room1", "hello from server room1");
    })

    socket.on('events', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("events", data)
        }
    })

    socket.on('playerCoords', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("playerCoords", data)
        }
    })

    socket.on('monsterCoords', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("monsterCoords", data)
        }
    })

    socket.on('playerDeath', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("playerDeath", data)
        }
    })

    socket.on('end game', () => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            io.to(userRoom).emit("end game")
        }
    })

});


server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);
