const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require("socket.io")

let rooms = {}
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
        console.log('message: ', message ," from: ", socket.id);
        io.emit('test message', 'test message from server');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);

        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.leave(userRoom)
            delete rooms[userRoom]
            console.log(rooms)
            io.to(userRoom).emit("end game")
        }
    });

    socket.on('init game', () => {
        // add in rooms object
        const hostSocketId = socket.id;

        const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(hostSocketId));

        if (!isClientAlreadyInRoom) {
            const roomIdToString = roomId + ""
            // add in socket room
            socket.join(roomIdToString)

            rooms[roomIdToString] = [hostSocketId]
            socket.emit('new room', roomIdToString);
            roomId++
            console.log("init game", rooms)

        }

    })

    socket.on('join game', (roomNumber) => {

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
            io.to(roomNumber).emit('join room', roomNumber)
        }

    })

    socket.on('send rules', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            console.log(data)
            socket.to(userRoom).emit("send rules", data)
        }
    })

    socket.on('player coords', (coords) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("player coords", coords)
        }
    })

    socket.on('monster coords', (coords) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("monster coords", coords)
        }
    })

    socket.on('player death', () => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("player death")
        }
    })

    socket.on('end game', () => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            socket.leave(userRoom)
            delete rooms[userRoom]
            console.log(rooms)
            io.to(userRoom).emit("end game")
        }
    })

    socket.on('game won', () => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

        if (userRoom) {
            io.to(userRoom).emit("game won")
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
