const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { Server } = require("socket.io")

const rooms = {}
let roomId = 100;

/*

  {
    "room1": [ipAddr1, ipAddr2],
    "room2": [ipAddr3, ipAddr4],
    "room3": [ipAddr5, ipAddr6]
  }

 */

// maybe handle user disconnect
// ideas for client
//  deviceId = generateUniqueId(); // Implement this function
//     localStorage.setItem('deviceId', deviceId);
// or store ip address


// creer room pour J1
// creer room et mettre dans rooms et sockets join list

// J2 join
// verif if room name given by J2 is in rooms if yes inclure J2 in room, if no return message room not exist
// once J2 join io.emit to room start game (allowing unity to run game, web to move to gameplay page)

// logique pour trouver room en fonction du socket unity si il est déja dedans
// une fois room trouvé socket.to les events

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
    //console.log(socket)
    console.log('a user connected', socket.id);
    console.log('User connected from:', socket.handshake.address);
    console.log(socket.connected);
    console.log(socket);


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
        console.log(roomId)

        // add in rooms object
        //let isClientAlreadyInRoom = false
        const hostIpAddress = socket.handshake.address;

       /* Object.keys(rooms).forEach(key => {
            isClientAlreadyInRoom = rooms[key].includes(hostIpAddress)
        });*/
        const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(hostIpAddress));


        if (!isClientAlreadyInRoom) {
            // add in socket room
            socket.join(roomId)

            rooms[roomId] = [hostIpAddress]
            io.emit('new room', rooms);
            roomId++

        }

        console.log(rooms)

    })

    socket.on('join game', (roomNumber) => {

        console.log(roomNumber, 'here');
        

        // verif if user not already in rooms
        // put user in rooms
        // socket.join()

        // property socket.rooms -> list rooms for the socket in an objects, by default socket is in a room -> ex: Set(2) { 'nyBeoS4V7eVHYPpcAAAF', 'room1' }

        const hostIpAddress = socket.handshake.address;

        console.log(typeof roomNumber) // to debug next comparison

        const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(hostIpAddress));
        const doesRoomExist = Object.keys(rooms).some(room => room == roomNumber);
        console.log('rooms',rooms.toString() + ' ' + 'room exist' + doesRoomExist);
        console.log('is already in room', isClientAlreadyInRoom);
        console.log('salle pleine', rooms[roomNumber].length < 2);
        console.log('ip adress', hostIpAddress);
        

        
        

        // if (doesRoomExist) {
        //     console.log('on est avant');

        //     if (!isClientAlreadyInRoom) {
        //         console.log('on est la :-)');
                
        //         if (rooms[roomNumber].length < 2) {
        //             socket.join(roomNumber)
        //             rooms[roomNumber].append(socket.handshake.address)
        //             io.emit("join room", rooms)
        //         } else {
        //             socket.emit('full room')
        //         }
        //     } else {
        //         socket.emit('already in room')
        //     }
        // } else {
        //     socket.emit('room does not exist')
        //     console.log('on est pas la');

        // }

        if (doesRoomExist && !isClientAlreadyInRoom && rooms[roomNumber].length < 2) {
            console.log('room existe');
            console.log('on peut entrer');
            socket.join(roomNumber)
            rooms[roomNumber].append(socket.handshake.address)
            io.emit("join room", rooms)

        } else {
            !doesRoomExist ?? socket.emit('room does not exist')
            isClientAlreadyInRoom ??   socket.emit('already in room');
            rooms[roomNumber].length == 2 ?? socket.emit('full room');
            
            console.log('on est pas la');
        }
    console.log(doesRoomExist);

    })

    

    socket.on('send room', () => {
        socket.to("room1").emit("event room1", "hello from server room1");
    })

    socket.on('events', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.handshake.address)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("events", data)
        }
    })

    socket.on('player coordinates', (data) => {
        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.handshake.address)) || null;

        if (userRoom) {
            socket.to(userRoom).emit("player coordinate", data)
        }
    })

    socket.on('end game', () => {
        // algo to find room from ip address, put it then globally
        // io.to(room).emit("end game")

      /*  let userRoom = null
        Object.keys(rooms).forEach(key => {
            if (rooms[key].includes(socket.handshake.address)) {
                userRoom = key
            }
        });*/

        const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.handshake.address)) || null;

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

// server.listen(port);

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
  });
