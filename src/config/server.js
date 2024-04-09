const express = require('express')
const cors = require('cors');

class Server {
    constructor(){
        this.app = express();
        this.port  = process.env.PORT || 3000;
        this.bluboxStore = '/api';
        this.tokenIngram = '/token'
        this.orderIngram = '/orders'

        this.middlewares();

        this.routes();
    }
    
    middlewares(){
        this.app.use(cors());   

        this.app.use( express.json());

        this.app.use( express.static('public'));
    }

    routes(){
        // ? Productos
        this.app.use(this.bluboxStore, require('../routes/products.routes'));
        //? Token
        this.app.use(this.tokenIngram, require('../routes/tokens.routes'));
        // ? Marcas
        this.app.use(this.bluboxStore, require('../routes/marcas.routes'));
        // ? Categorias
        this.app.use(this.bluboxStore, require('../routes/categorias.routes'));
        // ? Imagenes
        this.app.use(this.bluboxStore, require('../routes/images.routes'));
        
        // ? Fichas 2
        this.app.use(this.bluboxStore, require('../routes/fichas2.routes'));
        // ? Orders
        this.app.use(this.orderIngram, require('../routes/orders.routes'))
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log(`Servidor Corriendo en el Puerto ${ this.port }`);
        })
    }

}

module.exports = Server;
