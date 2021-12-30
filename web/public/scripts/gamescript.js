let roomDisp = document.getElementById('gameRoomId')

let gametable = document.getElementsByClassName('gametable')[0]
let potElem = document.getElementsByClassName('pot')[0]

// Get query parameters
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries())
let roomID = params.roomID
let username = params.username

// Alert components
let connectAlert, disconnectAlert
let connectText = document.getElementById('connectText')
let disconnectText = document.getElementById('disconnectText')

const socket = io(SOCKURL);

// Render players
function clearBoxes() {
    let cols = document.getElementsByClassName('col')
    for (let i = 0; i < cols.length; i++) {
        cols[i].innerHTML = ''
        cols[i].classList.remove('playerbox')
        console.log(cols[i].innerHTML)
    }
}

function renderchips(chipcount) {
    let img_value_map = {
        '100': 'blackchipflat.png',
        '50': 'greenchipflat.png',
        '10': 'bluechipflat.png',
        '5': 'redchipflat.png',
        '1': 'yellowchipflat.png'
    }

    let chipdiv = document.createElement('div')
    chipdiv.style.position = 'relative'
    chipdiv.style.display = 'grid'
    chipdiv.style.gridAutoColumns = 'repeat(5, 1fr)'
    chipdiv.style.gridAutoRows = 'repeat(20, 1fr)'

    let chiptype = 1
    for (const [key, value] of Object.entries(chipcount)) {

        for (let i = 0; i < value; i++) {
            let imgsrc = `./assets/${img_value_map[key]}`
            var img = new Image(20, 5);
            img.src = imgsrc

            img.style.gridColumnStart = chiptype
            img.style.gridRowStart = 20 - i

            chipdiv.appendChild(img)
        }
        chiptype += 1
    }

    return chipdiv
}

function renderPBox(player, pos) {
    let dtoadd = document.getElementById(String(pos))
    dtoadd.classList.add('playerbox')

    let pmoney = document.createElement('p')
    pmoney.innerHTML = player.money

    // calc chips defined in setup.js
    let chipCount = calcChips(player.money)
    let chipsElem = renderchips(chipCount)

    let pname = document.createElement('p')
    pname.innerHTML = player.name

    dtoadd.appendChild(pname)
    dtoadd.appendChild(chipsElem)
    dtoadd.appendChild(document.createElement('br'))
    dtoadd.appendChild(pmoney)
}

function renderAllP(players) {
    console.log(players)
    clearBoxes()
    let i = 1
    players.forEach(x => {
        if (x.name == username) {
            renderPBox(x, 7)
        } else {
            if (i == 7) {
                i += 1
            }
            renderPBox(x, i)
            i += 1
        }
    })
}

function renderPot(pot) {
    potElem.innerHTML = ''

    let chipcount = calcChips(pot.money)
    console.log('pot chip count', chipcount)
    let renderedpot = renderchips(chipcount)
    potElem.appendChild(renderedpot)
    potElem.innerHTML += pot.money
}

// Button handlers
function putPot(amt) {
    let curPlayer = game.players.filter(x => x.name == username)[0]
    if (curPlayer.money < amt) {
        window.alert('Insufficient balance')
    } else {
        socket.emit('putPot', game.roomID, username, amt, (name, amt) => { updatePutPot(name, amt) })
    }
}

function takeFromPot() {
    console.log(username, 'taking')
    socket.emit('takePot', game.roomID, username, (name) => { updateTakePot(name) })
}

// Chip count socket callbacks
function updatePutPot(name, money) {
    game.putInPot(name, money)
    renderAllP(game.players)
    renderPot(game.pot)
    console.log('put chip count', game)
}

function updateTakePot(name) {
    game.outOfPot(name)
    renderAllP(game.players)
    renderPot(game.pot)
    console.log('post take out', game)
}


// Socket code

// Joining game callback
function joinGameCb(gameInfo) {
    // Prepare room id and username 
    roomDisp.innerHTML = `Room: ${roomID}`
    console.log(roomID)
    game = new Game(roomID, 500)

    game.players = gameInfo.players
    game.pot = gameInfo.pot

    renderAllP(game.players)
    renderPot(game.pot)
}

// Listen for updates
socket.on('updatePutPot', (name, amt) => {
    updatePutPot(name, amt)
})

socket.on('updateTakePot', (name) => {
    updateTakePot(name)
})

socket.on('new-user', (name) => {
    console.log('new user', name)
    game.addPlayer(name)
    renderAllP(game.players)
    renderPot(game.pot)

    console.log(name, 'connected')
    UIkit.notification(`${name} has joined`, { status: 'success', timeout: 1000 });

})

socket.on('userDisconnect', (username) => {
    game.removePlayer(username)
    renderAllP(game.players)
    renderPot(game.pot)

    UIkit.notification(`${username} has left`, { status: 'danger', timeout: 1000 });
})


window.onload = () => {
    document.getElementById('pot').onclick = () => {
        socket.emit('takePot', game.roomID, username, (name) => { updateTakePot(name) })
    }
    socket.emit('join-room', username, roomID, (data) => { joinGameCb(data) })
}


