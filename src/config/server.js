const express = require('express')
const cors = require('cors');

class Server {
    constructor(){
        this.app = express();
        this.port  = process.env.PORT || 3000;
        this.technoIngram = '/apibdi';
        this.techno = '/apiprovedor';
        this.tokenIngram = '/tokeningram'
        this.orderIngram = '/ordersIngram'

        this.middlewares();

        this.routes();
    }
    
    middlewares(){
        this.app.use(cors());   

        this.app.use( express.json());

        this.app.use( express.static('public'));
    }

    routes(){

        // ! ----- Ingram Routes --------------------------------
        // ? Productos
        this.app.use(this.technoIngram, require('../routes/RoutesIngram/products.routes'));
        //? Token
        this.app.use(this.tokenIngram, require('../routes/RoutesIngram/tokens.routes'));
        // ? Marcas
        this.app.use(this.technoIngram, require('../routes/RoutesIngram/marcas.routes'));
        // ? Categorias
        this.app.use(this.technoIngram, require('../routes/RoutesIngram/categorias.routes'));
        // ? Imagenes
        this.app.use(this.technoIngram, require('../routes/RoutesIngram/images.routes'));
        
        // ? Fichas 2
        this.app.use(this.technoIngram, require('../routes/RoutesIngram/fichas2.routes'));
        // ? Orders
        this.app.use(this.orderIngram, require('../routes/RoutesIngram/orders.routes'));

        // ----------------------------------------------------------------


    }

    listen(){
        this.app.listen( this.port, () => {
            console.log(`Servidor Corriendo en el Puerto ${ this.port }`);
        })
    }

}

module.exports = Server;
