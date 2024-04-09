# API REST + Woocomerce + MYSQL + EXPRESS 🇲🇽

API REST + Woocomerce + MYSQL + EXPRESS creacion de modulos y rutas para mantenimiento de proyectos generados en Worpress con Woocomerce


## Run Locally

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```
Start Developer Test

```bash
  npm test
```

## Documentation

- [Example in Token](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#examples-in-token-access-one)
- [Example in Marcas](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#examples-in-marcas-2%EF%B8%8F%E2%83%A3)
- [Example in Categorias](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#examples-in-categorias-three)
- [Example in Productos](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#examples-in-productos-four)
- [Example in Orders](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#examples-in-orders-five)
- [Tech-Stack](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#tech-stack-)
- [Authors](https://github.com/Blue-Diamond-Innovation/WooAPINetStore/blob/main/README.md#authors)

# :large_blue_circle: API Reference Project :large_blue_circle:

- Agrega la base de datos al proyecto principal.
- Antes de realizar la ejecucion de Rutas, edite los Tokens dentro de `tbl_tokens` para realizar los siguiente pasos.
- Trucate a todas las tablas `tbl_categorias`, `tbl_marcas`, `tbl_productos`, `tbl_orders`.
- Agregue la utilidad General en `tbl_utilidades`.
- Comienza...

# Examples in Token Access :one:
## Instrucciones: 

Para actualizar y consultar prices a Woocomerce realizar los siguientes pasos en el mismo Orden:

- Agregar el Token a MySql corriendo la siguiente ruta: 
```https
  GET <URLHost> /token
```
:round_pushpin: Nota: No nesecita mas acciones, solo actualizar cada hora desde heroku o corriendo la ruta principal

-------------------------------------------------------------
# Examples in Marcas 2️⃣
## Instrucciones: 

Para obtener y agregar Marcas de BDI a Woocomerce realizar los siguientes pasos en el mismo Orden: 

- Agregar los Marcas de BDI a Base de datos corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/marcas
```
- Agregar las Marcas de Base de datos a Woocomerce corriendo la siguiente ruta: 

```https
  POST <URLHost> /api/marcaswoo
```
---

# Examples in Categorias :three:
## Instrucciones: 

Para obtener, agregar y actualizar las Categorias de BDI a Woocomerce realizar los siguientes pasos en el mismo Orden: 

- Agregar los Categorias de BDI a Base de datos corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/categorias
```
- Agregar las Categorias de Base de datos a Woocomerce corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/categoriasWoo
```
- Actualizar los Parent correspondientes de las Categorias de BDI a Base de datos corriendo la siguiente ruta: 
```https
  POST <URLHost> / api/categoriasparent
```
- Actualizar las Categorias de Base de datos a Woocomerce corriendo la siguiente ruta: 
```https
  POST <URLHost> / api/categoriasparentwoo
```
:round_pushpin: Nota del punto 3: Editar validaciones en `modules/categorias/postCategories.modules.js`, Solo en Versiones de actualización de Segmentacion o Nuevos proyectos. Ejemplo en la parte de abajo:

```javascript
  // Parseamos el parent a entero - Proveniente de BDI server
const parent_id = parseInt(categorias.parent)
                
                // Validamos los valores que no tienen Parent ID
                if(parent_id === 0){
                    try {
                        // Actualizamos a 0 el que tenga no tenga parent
                        const UpdateData = `UPDATE tbl_categorias SET Parent = 0 Where Nombre = '${ categorias.nombre }'`;
          
                        await pool.query(UpdateData);
                    } catch (error) {
                        throw error
                    }
                    // Para mas opciones que tengan Parent ID trendemos que modificar la validacion.
                }else if(parent_id === 6){
                    try {
                        // Realizamos la consulta del mismo valor id_bdi
                        const querySelect = `SELECT * FROM tbl_categorias where id_bdi = 6`;

                        const [rows] = await pool.query(querySelect);
                         // La respuesta de la consulta obtiene el ID proveniente de `Woocomerce`, y actualizamos segun el nombre de la misma.
                      
                        const UpdateData = `UPDATE tbl_categorias SET Parent = ${ rows[0].id } where Nombre = '${ categorias.nombre }'`;

                        await pool.query(UpdateData);
                    } catch (error) {
                        throw error
                    }
                }
```
---

# Examples in Productos :four:
## Instrucciones: 

Para obtener, agregar y actualizar los productos de BDI a Woocomerce realizar los siguientes pasos en el mismo Orden: 

- Agregar los Productos de BDI a Base de datos corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/products
```

- Agregar las Productos de base de datos a Woocomerce corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/productswoo
```

- Actualizar los Precios de Productos de Ingram a Base de datos corriendo la siguiente ruta: 
```https
  GET <URLHost> /api/productsput
```

- Actualizar los Precios de Productos de Base de datos a Woocomerce corriendo la siguiente ruta: 
```https
  POST <URLHost> /api/productsputwoo
```

:round_pushpin: Nota: Automatizar 3 veces al dia para actualizacion de Inventario en Base de datos y para Woocomerce (Solo Actualizar en Heroku).

---

# Examples in Orders :five:
## Instrucciones:

Para crear una Orden de Woocomerce a Ingram realizar los siguientes pasos en el mismo Orden: 

- Subir el proyecto a Heroku copiar el dominio de la app creada, de la misma manera Crear un WebHook y Utilizar la siguiente ruta para agendar con un WebWook a Woocomerce
```https
  POST <URLHost> /orders/
```

:round_pushpin: Nota: Esto se ejecutara de manera automatica, si hay una orden nueva o orden actualizada dentro de la app se ejecutara la funcion dentro de `module/orders/postOrder.modules.js`, solo se ejecutara si el `state` de la orden es `processing`.

---

## Tech Stack 🛠

**Server:** Node, Express, Mysql, Axios, Chunk Array, env, Woocomerce API Rest


## Authors

- [@John Aldair](https://github.com/JonaMasterFull)
- [@Tom](https://github.com/otonielcarlos)



![Logo](https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img/https://techno-shop.mx/wp-content/uploads/2024/02/TS_1_250x150-1.png)
