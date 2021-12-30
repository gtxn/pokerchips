let game, username
let gametable, potElem

// Button event handlers
function newGame() {
    username = document.getElementById('newName').value
    if (username == null) {
        window.alert('Username cannot be null.')
        return
    }

    fetch(`${SOCKURL}/genRoomID`)
        .then(res => res.json())
        .then(obj => {
            let room = obj['roomID']
            console.log(obj)
            window.location.href = `${WEBURL}/game?roomID=${room}&username=${username}`;
            return obj
        })
        .catch(e => { console.log(e) })
}

function joinGame() {
    let roomID = (document.getElementById('room').value).toUpperCase()
    username = document.getElementById('joinName').value

    if (roomID == null || username == null) {
        window.alert('Room ID and username cannot be null.')
        return
    }

    fetch(`${SOCKURL}/isJoinValid?roomID=${roomID}&username=${username}`)
        .then(res => res.json())
        .then(obj => {
            let valid = obj.valid
            if (valid) {
                window.location.href = `${WEBURL}/game?roomID=${roomID}&username=${username}`;
            } else {
                err = obj.err
                if (err == 'max players') {
                    window.alert('Maximum player size of 8 has been reached.')
                } else if (err == 'no such room') {
                    window.alert('No such room available. To create a room, press create room.')
                } else if (err = 'another user with same name') {
                    window.alert('Please change your username, as another user has the same username')
                }
            }
        })
        .catch(e => {
            console.log(e)
        })

    console.log(roomID, username)
}
