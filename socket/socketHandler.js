const {initGame, joinGame, sendInfoToRoom, endGame, gameWon} = require("./socketService");

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

// P1 and P2 end the game and quit it
// remove from rooms and socket lists

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected from:', socket.id);

        // Socket listeners

        socket.on('test message', (message) => {
            console.log('message: ', message ," from: ", socket.id);
            io.emit('test message', 'test message from server');
        });

        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
            endGame(socket, io)
        });

        socket.on('init game', () => {
           initGame(socket)
        })

        socket.on('join game', (roomNumber) => {
            joinGame(socket, roomNumber, io)
        })

        socket.on('send rules', (rules) => {
            sendInfoToRoom('send rules', rules, socket)
        })

        socket.on('player coords', (coords) => {
            sendInfoToRoom('player coords', coords, socket)
        })

        socket.on('monster coords', (coords) => {
            sendInfoToRoom('monster coords', coords, socket)
        })

        socket.on('player death', () => {
            sendInfoToRoom('player death', null, socket)
        })

        socket.on('end game', () => {
            endGame(socket, io)
        })

        socket.on('game won', () => {
            gameWon(socket, io)
        })
    });

}

module.exports = setupSocket;


