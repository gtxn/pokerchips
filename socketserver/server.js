const PORTNUM = process.env.PORT || 4000
const path = require('path');

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)
const io = require("socket.io")(server, {
    cors: { origin: '*' }
})


const helper = require('./helper');
let rooms = []
let usedRoomIDs = []

// With object of structure {<socketID> : {name: <name>, roomID: <roomID>}}
let idNameDict = {}

// Object of structure {<roomID>+<name>: {timeout: setTimeout}}
let disconnected = {}

function didRecentDisconnect(roomID, name) {
    let disconID = String(roomID) + String(name)
    let disconInfo = disconnected[disconID]
    console.log(disconID)
    console.log(disconnected)

    return disconInfo
}


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())


app.get('/', (req, res) => {
    res.send('Hi from pokerserver!')
})

app.get('/roomInfo', (req, res) => {
    let room = req.query.roomID
    let data = rooms.filter(x => x.roomID == room)
    res.send(data)
})

app.get('/genRoomID', (req, res) => {
    let roomID = helper.genRoom()
    console.log('roomid:', roomID)
    while (usedRoomIDs.filter(x => x == roomID).length != 0) {
        roomID = helper.genRoom()
    }

    console.log('usedrooms', usedRoomIDs)
    res.send({ 'roomID': roomID })
})

app.get('/isJoinValid', (req, res) => {
    let testRoomID = req.query.roomID
    let username = req.query.username

    console.log(usedRoomIDs, testRoomID)
    if (usedRoomIDs.filter(x => x == testRoomID) == '') {
        console.log('nosuchroom')
        res.send({ valid: false, err: 'no such room' })

    } else {
        let roomPlayers = rooms.filter(x => x.roomID == testRoomID)[0].players
        if (roomPlayers.length >= 8) {
            res.send({ valid: false, err: 'max players' })
        }

        else if (roomPlayers.filter(x => x.name == username) != '') {
            // check if player just disconnected

            if (didRecentDisconnect(testRoomID, username) != null) {
                res.send({ valid: true, err: null })
            } else {
                console.log('same naamee')
                res.send({ valid: false, err: 'another user with same name' })
            }
        }
        else {
            console.log('yes')
            res.send({ valid: true, err: null })
        }
    }

})

app.get('*', function (req, res) {
    res.send('Thats not valid. Whooooops.')
});

server.listen(PORTNUM, () => {
    console.log(`socket server running on port ${PORTNUM}`)
})

io.on("connection", socket => {
    console.log('socket connected: ', socket.id)

    socket.on('join-room', (name, roomID, cb) => {
        console.log(name, 'joined')

        let room

        socket.join(roomID)

        // Save new socket id with name and roomID
        idNameDict[socket.id] = { name, roomID }

        let disconInfo = didRecentDisconnect(roomID, name)

        // Check if disconInfo is available by checking if null
        if (disconInfo != null) {
            console.log(name, 'recent disconnect')
            clearTimeout(disconInfo.timeout)
            console.log('timeout', disconInfo.timeout)

            room = rooms.filter(x => x.roomID == roomID)[0]

        } else {
            socket.to(roomID).emit('new-user', name)

            let roomExists = (usedRoomIDs.filter(x => x == roomID) != '')

            if (roomExists) {
                room = rooms.filter(x => x.roomID == roomID)[0]

                if (room.players.filter(x => x.name == name) != '') {
                    console.log('same username')
                } else {
                    room.addPlayer(name)
                }

            } else {
                room = helper.room(roomID, 500)
                room.addPlayer(name)
                rooms.push(room)

                usedRoomIDs.push(roomID)
                console.log('room pushed to usedroomid')
            }
        }

        cb(room)

    })

    socket.on('putPot', (roomID, name, amt, cb) => {
        let d = rooms.filter(x => x.roomID == roomID)
        if (d.length > 0) {
            let room = d[0]
            room.putInPot(name, amt)

            cb(name, amt)

            socket.to(roomID).emit('updatePutPot', name, amt)

        } else {
            console.log('putPot ID invalid')
        }
    })

    socket.on('takePot', (roomID, name, cb) => {
        let d = rooms.filter(x => x.roomID == roomID)
        if (d.length > 0) {
            let room = d[0]
            room.outOfPot(name)

            cb(name)

            socket.to(roomID).emit('updateTakePot', name)

        } else {
            console.log('putPot ID invalid')
        }
    })

    socket.on('disconnect', () => {
        let sockInfo = idNameDict[socket.id]
        console.log('sockinfo', sockInfo)

        let disconID = sockInfo.roomID + sockInfo.name
        disconnected[disconID] = {
            timeout: setTimeout(() => {
                if (sockInfo != null) {
                    if (sockInfo.roomID) {
                        console.log(sockInfo.name, 'Real disconnect')
                        let room = rooms.filter(x => x.roomID == sockInfo.roomID)

                        if (room.length >= 1) {
                            room = room[0]
                            room.removePlayer(sockInfo.name)
                            socket.to(sockInfo.roomID).emit('userDisconnect', sockInfo.name)

                            // If no players are left in the room, destroy the room
                            if (room.numPlayers == 0) {
                                console.log('no players left oops')

                                rooms = rooms.filter(x => x.roomID != room.roomID)
                                usedRoomIDs = usedRoomIDs.filter(x => x != room.roomID)
                            }
                        }

                        delete idNameDict[socket.id]
                    }
                }
            }, 5000)
        }

    })
});