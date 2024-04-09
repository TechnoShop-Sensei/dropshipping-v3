const { urlOrderIngramSandbox, urlOrderIngram, urlPricesIngram } = require('../../Helpers/rutas.ingram');
const configGeneral = require('../../Ingram/config.ingram')
const axios = require('axios');
const pool = require('../../database/conexion');
const estadosSwitch = require('../../Helpers/estados');
const configclass = new configGeneral();

class PutOrderIngram {
    
    async UpdateOrderIngram (status, data){
        try {
            if(status === "processing"){

                const queryConsultar = `SELECT * FROM tbl_orders where customerOrderNumber = ?`
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
                    // ? Obtiene el listado de Productos Woocommerce
                    const lines = data.line_items.map((items, index) => {
                        return {
                            customerLineNumber: index + 1,
                            ingramPartNumber: items.sku,
                            quantity: items.quantity,
                        };
                    });

                    // ? Crea array de SKU - Ingram Part Number
                    const lineSKu = data.line_items.map((items, index) => {
                        return {
                            ingramPartNumber: items.sku,
                        };
                    });

                    let msg = []

                    const promises = lineSKu.map(async (lineItem) => {
                        let data = {
                            products: lineItem
                        }
                    
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
                                    }
                                ]
                        }
                    
                        const Branchv5 = this.ComprobarSKUv5(data, datos, shipToInfo, lines, estado, customerOrderNumber)
                    
                        if(Branchv5 > 0){
                            return 'Ejecuntando Orden Branch V5'
                        }else {
                            const BranchV10 = this.ComprobarSKUV10(data,datos,shipToInfo, lines, estado, customerOrderNumber);
                            
                            if(BranchV10 > 0){
                                return 'Ejecutando Orden Branch V10'
                            } else{
                                const BranchV3 = this.ComprobarSKUV3(data,datos,shipToInfo,lines,estado, customerOrderNumber);
                                if(BranchV3 > 0){
                                    return 'Ejecutando Orden Branch V3'
                                }
                            }
                        }
                    });

                    await Promise.all(promises);
                }
                
            }else{
                console.log("Orden no Processing")
            }
            
        } catch (error) {
            console.error('Error al realizar la consulta:', error);
            throw new Error
        }
    }

    async ComprobarSKUv5 (dataSku, datosLine, shipToInfo, lines, status, customerOrderNumber){

        const configV3  = await configclass.configHeaderGeneralV3();

        const comprobarSkuBranchV03 = await axios.get(urlPricesIngram, dataSku, configV3)
                        
        comprobarSkuBranchV03.data.forEach(async(validarItem) => {

            const quantity = (validarItem.hasOwnProperty('availability') && validarItem.availability.hasOwnProperty('totalAvailability')) ? validarItem.availability.totalAvailability : 0
            const qty = (validarItem.productStatusMessage === "CUSTOMER NOT AUTHORIZED" || validarItem.productStatusMessage === "ITEM DISCONTINUED") ? 0 : quantity
            

            if(qty > 0){

                const configGeneralOrdersV5 = await configclass.configGeneralOrdersV5()
                try {
                    const enviar = await axios.post( urlOrderIngram , datosLine, configGeneralOrdersV5 );
    
                    const dataRecibida = enviar.data;
    
                    const query = `INSERT INTO tbl_orders (customerOrderNumber, status_order, notes, shipToInfo, Productos, dataIngram) VALUES (?, ?, ?, ?, ?, ?)`;
                    const values = [customerOrderNumber, status, notes, JSON.stringify(shipToInfo), JSON.stringify(lines), dataRecibida];
                    await pool.query(query, values);
    
                    msg.push(`Creando: ${ enviar.data }`)
                } catch (error) {
                    msg.push(`Error de Orden: ${ error }`)
                    throw error
                }
    
                return stock
            }else {
                return 'No Hay stock'
            }
        });
    }

    async ComprobarSKUV10 (dataSku, datosLine, shipToInfo, lines, status, customerOrderNumber){
        const configV10  = await configclass.configHeaderGeneral();

        const comprobarSkuBranchV10 = await axios.get(urlPricesIngram, dataSku, configV10)
                        
        comprobarSkuBranchV10.data.forEach(async (validarItem) => {
            const PartNumber = validarItem.ingramPartNumber;
            const availability = validarItem.availability || {};
            const quantity = availability.hasOwnProperty('totalAvailability') ? availability.totalAvailability : 0;
            const qty = (validarItem.productStatusMessage === "CUSTOMER NOT AUTHORIZED" || validarItem.productStatusMessage === "ITEM DISCONTINUED") ? 0 : quantity;
        
            // Obtener la suma total sin los productos de VENTAS-TIJUANA
            const totalWithoutTijuana = (availability.availabilityByWarehouse || []).reduce((total, item) => {
                const qtyAvailable = item.quantityAvailable || 0;
        
                // Verificar si la ubicación es diferente a "VENTAS-TIJUANA" y si tiene quantityAvailable
                if (item.location !== "VENTAS-TIJUANA" && typeof qtyAvailable === 'number') {
                    total += qtyAvailable;
                }
        
                return total;
            }, 0);
        
        
            if(totalWithoutTijuana > 0){

                const configGeneralOrdersV3 = await configclass.configGeneralOrdersV3()
                try {
                    const enviar = await axios.post( urlOrderIngram , datosLine, configGeneralOrdersV3 );
    
                    const dataRecibida = enviar.data;
    
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
        });

        
    }

    async ComprobarSKUV3 (dataSku, datosLine, shipToInfo, lines, status, customerOrderNumber){
        const configV3  = await configclass.configHeaderGeneralV3();

        const comprobarSkuBranchV03 = await axios.get(urlPricesIngram, dataSku, configV3)
                        
        comprobarSkuBranchV03.data.forEach(async(validarItem) => {

            const quantity = (validarItem.hasOwnProperty('availability') && validarItem.availability.hasOwnProperty('totalAvailability')) ? validarItem.availability.totalAvailability : 0
            const qty = (validarItem.productStatusMessage === "CUSTOMER NOT AUTHORIZED" || validarItem.productStatusMessage === "ITEM DISCONTINUED") ? 0 : quantity
            

            if(qty > 0){

                const configGeneralOrdersV3 = await configclass.configGeneralOrdersV3()
                try {
                    const enviar = await axios.post( urlOrderIngram , datosLine, configGeneralOrdersV3 );
    
                    const dataRecibida = enviar.data;
    
                    const query = `INSERT INTO tbl_orders (customerOrderNumber, status_order, notes, shipToInfo, Productos, dataIngram) VALUES (?, ?, ?, ?, ?, ?)`;
                    const values = [customerOrderNumber, status, notes, JSON.stringify(shipToInfo), JSON.stringify(lines), dataRecibida];
                    await pool.query(query, values);
    
                    msg.push(`Creando: ${ enviar.data }`)
                } catch (error) {
                    msg.push(`Error de Orden: ${ error }`)
                    throw error
                }
    
                return stock
            }else {
                return 'No Hay stock'
            }
        });
    }
}

module.exports = PutOrderIngram