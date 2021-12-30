exports.genRoom = function () {
    let all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let roomID = ''

    for (let i = 0; i < 6; i++) {
        let ind = Math.floor(Math.random() * all.length)
        roomID += all[ind]
    }

    return roomID
}

class Pot {
    constructor(money) {
        this.money = money
    }
}

class Player {
    constructor(name, money) {
        this.name = name;
        this.money = money;
    }
}

class Room {
    constructor(roomID, plStartMoney) {
        this.roomID = roomID
        this.plStartMoney = plStartMoney

        this.players = []
        this.numPlayers = 0

        this.pot = new Pot(0)
    }

    addPlayer(name) {
        this.players.forEach((x) => {
            if (name == x.name) {
                return false
            }
        })

        let newP = new Player(name, this.plStartMoney)
        this.numPlayers += 1
        this.players.push(newP)
        return true
    }

    putInPot(name, amt) {
        let p = this.players.filter(x => x.name == name)
        if (p.length > 0) {
            p[0].money -= amt
            this.pot.money += amt
        } else {
            console.log('cannot put in pot for null player')
        }
    }

    removePlayer(name) {
        this.players = this.players.filter(x => x.name !== name)
    }

    outOfPot(name) {
        let p = this.players.filter(x => x.name == name)
        if (p.length > 0) {
            p[0].money += this.pot.money
            this.pot.money = 0
        } else {
            console.log('cannot put in pot for null player')
        }
    }

    dispInfo() {
        console.log('players: ', this.players)
        console.log('Money in pot: ', this.pot.money)
    }
}

exports.room = (id, start) => {
    return new Room(id, start)
}