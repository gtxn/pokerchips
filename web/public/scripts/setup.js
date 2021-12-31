// let SOCKURL = 'http://pokerchips-backend-env.us-east-1.elasticbeanstalk.com' || 'http://glendatxn.local:4000'
// let WEBURL = 'http://pokerchip-io.us-east-1.elasticbeanstalk.com' || 'http://localhost:3000'

let SOCKURL = 'http://glendatxn.local:4000'
let WEBURL = 'http://localhost:3000'

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

class Game {
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

    removePlayer(name) {
        this.players = this.players.filter(x => x.name !== name)
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

    outOfPot(name) {
        let p = this.players.filter(x => x.name == name)
        if (p.length > 0) {
            p[0].money += this.pot.money
            this.pot.money = 0
        } else {
            console.log('cannot put in pot for null player')
        }
    }
}

// Get number of chips based on number
function calcChips(val) {
    let finChipCount = {}

    let chipVals = [100, 50, 10, 5, 1, 0]
    let chipNum = 0
    for (let i = 0; i < chipVals.length - 1; i++) {
        chipNum = 0

        while (val >= chipVals[i]) {
            val -= chipVals[i]
            chipNum += 1
        }

        finChipCount[String(chipVals[i])] = chipNum
    }

    console.log(finChipCount)
    return finChipCount
}
