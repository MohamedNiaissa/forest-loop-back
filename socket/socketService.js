let rooms = {}

let roomId = 100;

const initGame = (socket) => {
    const hostSocketId = socket.id;

    const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(hostSocketId));

    if (!isClientAlreadyInRoom) {
        const roomIdToString = roomId + ""
        // add in socket room
        socket.join(roomIdToString)

        // create room from roomId and put socket id of host in the value of roomId
        rooms[roomIdToString] = [hostSocketId]
        socket.emit('new room', roomIdToString);
        roomId++
        console.log("init game", rooms)
    }
}

const joinGame = (socket, roomNumber, io) => {
    const guestIdAddress = socket.id;

    const isClientAlreadyInRoom = Object.values(rooms).some(room => room.includes(guestIdAddress));
    const doesRoomExist = Object.keys(rooms).some(room => room == roomNumber);

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
}

const sendInfoToRoom = (topic, data, socket) => {
    const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

    if (userRoom) {
        socket.to(userRoom).emit(topic, data)
    }
}

const endGame = (socket, io) => {
    const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

    if (userRoom) {
        io.to(userRoom).emit("end game")

        // remove all user from a specific room
        io.socketsLeave(userRoom);

        // remove room from rooms dict
        delete rooms[userRoom]
        console.log(rooms)
    }
}

const gameWon = (socket, io) => {
    const userRoom = Object.keys(rooms).find(key => rooms[key].includes(socket.id)) || null;

    if (userRoom) {
        // remove all user from a specific room
        socket.to(userRoom).emit("game won")
        io.socketsLeave(userRoom);
        delete rooms[userRoom]
    }
}


module.exports = {
    initGame,
    joinGame,
    sendInfoToRoom,
    endGame,
    gameWon
}
