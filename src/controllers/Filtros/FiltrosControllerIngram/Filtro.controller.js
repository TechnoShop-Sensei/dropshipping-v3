const { response, request } = require('express');
const pool = require('../../../database/conexion');

const FiltrosColores = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosColores.modules');
const FiltrosPulgadas = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosPulgadas.modules');
const FiltrosHerzt = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosHerzt.modules');
const FiltrosUpdateWoo = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosWooUpdate.modules');

const ColorClass = new FiltrosColores(pool);
const PulgadasClass = new FiltrosPulgadas(pool);
const HerztClass = new FiltrosHerzt(pool);

const UpdateAtributes = new FiltrosUpdateWoo(pool)



// ? Agregar Colores a Woocommerce Atributos
  const CrearOActualizarColoresWoo = async(req = request, res = response) => {
    ColorClass.AddAndUpdateFiltroColorsWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Filtros Colores a Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

//? Agregar Colores de Atributos igual a su Producto en BD
  const AgregarColorAProductBD = async(req = request, res = response) => {
    ColorClass.AgregarSegunColor()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Filtros a Productos segun su Color BD',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

// ? Agregar Pulgadas a Woocommerce Atributos
const CrearOActualizarPulgadasWoo = async(req = request, res = response) => {
  PulgadasClass.AddAndUpdateFiltrosPulgadasWoo()
  .then(msg => {
      console.log(msg);
      res.status(201).json({
            mensaje: 'Post Api - Agregando Filtros Pulgadas a Woocommerce',
            datos: msg
        })
  })
  .catch(error => {
      console.error(error);
  });
}

//? Agregar Pulgadas de Atributos igual a su Producto en BD
const AgregarPulgasAProductosBD = async(req = request, res = response) => {
  PulgadasClass.AgregarSegunPulgadas()
  .then(msg => {
      console.log(msg);
      res.status(201).json({
            mensaje: 'Post Api - Agregando Filtros a Productos segun su Pulgada BD',
            datos: msg
        })
  })
  .catch(error => {
      console.error(error);
  });
}


// ? Agregar Herzt a Woocommerce Atributos
const CrearOActualizarHerztWoo = async(req = request, res = response) => {
  HerztClass.AddAndUpdateFiltrosHerztWoo()
  .then(msg => {
      console.log(msg);
      res.status(201).json({
            mensaje: 'Post Api - Agregando Filtros Herzt a Woocommerce',
            datos: msg
        })
  })
  .catch(error => {
      console.error(error);
  });
}

//? Agregar Herzt de Atributos igual a su Producto en BD
const AgregarHerztAProductosBD = async(req = request, res = response) => {
  HerztClass.AgregarSegunHerzt()
  .then(msg => {
      console.log(msg);
      res.status(201).json({
            mensaje: 'Post Api - Agregando Filtros a Herzt segun su Pulgada BD',
            datos: msg
        })
  })
  .catch(error => {
      console.error(error);
  });
}

  // ! Actualizar Filtros Productos Ingram - Actualizar antes de Actualizar Atributos de Productos
  const ActualizarFiltrosAll = async(req = request, res = response) => {
    UpdateAtributes.ActualizarAtributosProductWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Actualizando Filtros a todos los productos en Woo',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

  

  




module.exports = {
    CrearOActualizarColoresWoo,
    AgregarColorAProductBD,

    CrearOActualizarPulgadasWoo,
    AgregarPulgasAProductosBD,

    CrearOActualizarHerztWoo,
    AgregarHerztAProductosBD,

    ActualizarFiltrosAll
}