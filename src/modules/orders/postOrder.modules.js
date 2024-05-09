const { urlOrderIngramSandbox, urlOrderIngram } = require('../../Helpers/helpsIngram/rutas.ingram');
const { urlPricesIngram } = require('../../Helpers/helpsIngram/rutas.ingram');

const configGeneral = require('../../Ingram/config.ingram')
const axios = require('axios');
const pool = require('../../database/conexion');
const estadosSwitch = require('../../Helpers/estados');

const chunks = require('chunk-array').chunks

const configclass = new configGeneral();


class PostOrderIngram {
    
    async CreateOrderIngram (status, data){
        try {
            if(status === "processing"){

                const queryConsultar = `SELECT * FROM centronetgo_project_woo.tbl_orders where customerOrderNumber = ?`
                const [rows] = await pool.query(queryConsultar, [`RSF_${data.id}`])
    
                if(rows.length > 0){
                    console.log('El valor ya existe en la base de datos. No se permite duplicar.')
                    return 'Orden ya Creada'
                }
                else{

                    console.log("Orden es Processing");
    
                    const customerOrderNumber = `RSF_${data.id}`;
                    const notes = data.customer_note;
    
                    const estado = estadosSwitch(data.billing.state);
    
                    const postalCode = data.billing.postcode.substring(0, 9);
                    const companyName = data.billing.company.substring(0, 34);
    
                    const contacto = `${data.billing.first_name} ${data.billing.last_name}`;
    
                    const direccion1 = data.billing.address_1;
                    const direccion2 = data.billing.address_2;
    
                    let addressLine1 = "";
                    let addressLine2 = "";
    
                    if (direccion1.length > 35) {
                        addressLine1 = direccion1.slice(0, 34);
                        addressLine2 = direccion1.slice(35);
                    } else {
                        addressLine1 = direccion1;
                        addressLine2 = direccion2;
                    }
    
                    const shipToInfo = {
                        contact: contacto.substring(0, 34),
                        companyName: companyName,
                        addressLine1: addressLine1,
                        addressLine2: addressLine2,
                        city: data.billing.city,
                        state: estado,
                        postalCode: postalCode,
                        countryCode: data.billing.country,
                        phoneNumber: data.billing.phone,
                    };
    
                    const lines = data.line_items.map((items, index) => {
                        return {
                            customerLineNumber: index + 1,
                            ingramPartNumber: items.sku,
                            quantity: items.quantity,
                        };
                    });

                    const lineSKu = data.line_items.map((items, index) => {
                        return {
                            ingramPartNumber: items.sku,
                        };
                    });

                   
                    
                    
                    const configV5  = await configclass.configHeaderGeneralV5()
                    const configV10  = await configclass.configHeaderGeneral()
                    const configV3  = await configclass.configHeaderGeneralV3()

                    let msg = []

                    for (const lineItem of lineSKu) {

                        let data = {
                            products: lineItem
                        }

                        const comprobarSkuBranchV5 = await axios.get(urlPricesIngram, data, configV5)
                        const stock1 = comprobarSkuBranchV5.data.availability;

                        if(stock1 > 0){

                             let datos = {
                                customerOrderNumber: customerOrderNumber,
                                shipToInfo: shipToInfo,
                                lines: lines,
                                additionalAttributes: [
                                    {
                                        "attributeName": "allowDuplicateCustomerOrderNumber",
                                        "attributeValue": "false"
                                    },
                                    {
                                        "attributeName": "allowOrderOnCustomerHold",
                                        "attributeValue": "true"
                                    },
                                    ]
                                }

                            const configGeneralOrdersV5  = await configclass.configGeneralOrdersV5()
                            try {
                                const enviar = await axios.post( urlOrderIngram , datos, configGeneralOrdersV5 );
            
                                let dataRecibida = enviar.data;
            
                                const query = `INSERT INTO tbl_orders (customerOrderNumber, status_order, notes, shipToInfo, Productos, dataIngram) VALUES (?, ?, ?, ?, ?, ?)`;
                                const values = [customerOrderNumber, status, notes, JSON.stringify(shipToInfo), JSON.stringify(lines), dataRecibida];
                                await pool.query(query, values);
            
                                msg.push(`Creando: ${ enviar.data }`)
                            } catch (error) {
                                msg.push(`Error de Orden: ${ error }`)
                                throw error
                            }
                            return msg    
                                         
                        }else{
                            const comprobarSkuBranchV10 = await axios.get(urlPricesIngram, data, configV10)
                        
                            const stock2 = comprobarSkuBranchV10.data.availability && comprobarSkuBranchV10.data.availability.totalAvailability.availabilityByWarehouse.location != "VENTAS-TIJUANA";
                            
                            if(stock2 > 0){

                                let datos = {
                                    customerOrderNumber: customerOrderNumber,
                                    shipToInfo: shipToInfo,
                                    lines: lines,
                                    additionalAttributes: [
                                        {
                                            "attributeName": "allowDuplicateCustomerOrderNumber",
                                            "attributeValue": "false"
                                        },
                                        {
                                            "attributeName": "allowOrderOnCustomerHold",
                                            "attributeValue": "true"
                                        },
                                        ]
                                    }
                                    
                                const configGeneralOrdersV10  = await configclass.configGeneralOrders()
                                try {
                                    const enviar = await axios.post( urlOrderIngram , datos, configGeneralOrdersV10 );
                
                                    let dataRecibida = enviar.data;
                
                                    const query = `INSERT INTO tbl_orders (customerOrderNumber, status_order, notes, shipToInfo, Productos, dataIngram) VALUES (?, ?, ?, ?, ?, ?)`;
                                    const values = [customerOrderNumber, status, notes, JSON.stringify(shipToInfo), JSON.stringify(lines), dataRecibida];
                                    await pool.query(query, values);
                
                                    msg.push(`Creando: ${ enviar.data }`)
                                } catch (error) {
                                    msg.push(`Error de Orden: ${ error }`)
                                    throw error
                                }
                                return msg 
                            }else {
                                const comprobarSkuBranchV03 = await axios.get(urlPricesIngram, data, configV3)
                        
                                const stock3 = comprobarSkuBranchV03.data.availability;

                                if(stock3 > 0){
                                    let datos = {
                                        customerOrderNumber: customerOrderNumber,
                                        shipToInfo: shipToInfo,
                                        lines: lines,
                                        additionalAttributes: [
                                            {
                                                "attributeName": "allowDuplicateCustomerOrderNumber",
                                                "attributeValue": "false"
                                            },
                                            {
                                                "attributeName": "allowOrderOnCustomerHold",
                                                "attributeValue": "true"
                                            },
                                            ]
                                        }
                                        
                                    const configGeneralOrdersV10  = await configclass.configGeneralOrders()
                                    try {
                                        const enviar = await axios.post( urlOrderIngram , datos, configGeneralOrdersV10 );
                    
                                        let dataRecibida = enviar.data;
                    
                                        const query = `INSERT INTO tbl_orders (customerOrderNumber, status_order, notes, shipToInfo, Productos, dataIngram) VALUES (?, ?, ?, ?, ?, ?)`;
                                        const values = [customerOrderNumber, status, notes, JSON.stringify(shipToInfo), JSON.stringify(lines), dataRecibida];
                                        await pool.query(query, values);
                    
                                        msg.push(`Creando: ${ enviar.data }`)
                                    } catch (error) {
                                        msg.push(`Error de Orden: ${ error }`)
                                        throw error
                                    }
                                    return msg 
                                }else {
                                    return 'No Hay stock'
                                }
                            }
                        
                        }
                        

                    }
                }
            }else{
                console.log("Orden no Processing")
            }
        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            throw new Error
        }
    }
}

module.exports = PostOrderIngram