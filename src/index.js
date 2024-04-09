const Server = require('./config/server')
require('dotenv').config()

const main = () => {
    const server = new Server();

    server.listen()
}

main()