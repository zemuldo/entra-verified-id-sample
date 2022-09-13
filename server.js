const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const sessionStore = require('./config/session')

const next = require('next')

const port = parseInt(process.env.PORT, 10) || 5002
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


app.prepare().then(() => {
    const server = express()

    server.use(express.static('public'))
    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(session({
        secret: 'cookie-secret-key',
        resave: false,
        saveUninitialized: true,
        store: sessionStore
    }))

    server.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    const issuer = require('./routes/issuer')
    const verifier = require('./routes/verifier')

    server.use("/api/issuer", issuer)
    server.use("/api/verifier", verifier)

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`)
    })
})