const { response, request } = require('express');
const pool = require('../../../database/conexion');
const FiltrosColores = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosColores.modules');
const FiltrosWoo = require('../../../modules/FiltrosModule/FiltrosIngram/filtrosWooUpdate.modules');

const ColorClass = new FiltrosColores(pool);
const UpdateAtributes = new FiltrosWoo(pool);

// ? Agregar Colores a Atributos Colores
  const CrearOActualizarColores = async(req = request, res = response) => {
    ColorClass.UpdateProductCategoriasWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Imagenes a productos BD',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }


  const AgregarColorAProduct = async(req = request, res = response) => {
    ColorClass.AgregarSegunColor()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Imagenes a productos BD',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }




  // ! Actualizar Filtros Productos Ingram
  const ActualizarFiltros = async(req = request, res = response) => {
    UpdateAtributes.ActualizarAtributosProductWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Imagenes a productos BD',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

  

  




module.exports = {
    CrearOActualizarColores,
    AgregarColorAProduct,
    ActualizarFiltros
}