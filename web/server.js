const PORTNUM = process.env.PORT || 3000
const path = require('path');

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.use(cors())


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname + `/public/game.html`))
})

server.listen(PORTNUM, () => {
    console.log(`web server running on port ${PORTNUM}`)
})
