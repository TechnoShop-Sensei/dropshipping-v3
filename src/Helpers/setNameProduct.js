const abreviarYTraducir = (texto) => {
    // Definir un diccionario de abreviaturas y traducciones
    const abreviaturas = {
      "ACCS": "ACCESORIOS",
      "SILVER": "PLATEADO",
      "ALUM": "ALUMINIO",
      "CASE": "FUNDA",
      "WHITE": "BLANCO",
      "SPOST": "DEPORTIVA",
      "BAND": "BANDA",
      "ORTIVA": "DEPORTIVA",
      "EPORTIVA": "DEPORTIVA",
      "DEP": "DEPORTIVA",
      "ESPA": "ESPACIAL",
      "ES": "ESPACIAL",
      "WITH": "CON",
      "ESPACIA": "ESPACIAL",
      "ESPACI": "ESPACIAL",
      "ESTEL": "ESTELAR",
      "INALAM": "INALAMBRICOS",
      "WRLS": "BLUETOOTH",
      "ESP": ",ESPAÑOL",
      "ESPAN": "ESPAÑOL",
      "ESPANOL": "ESPAÑOL",
      "C-TOUCH": "TOUCH",
      "C-CHIP": "CHIP",
      "P-IPAD": "IPAD",
      "SPANISH": "ESPAÑOL",
      "LATIN": "LATINO",
      "AMERICA": "AMERICANO",
      "BLACK": "NEGRO",
      "GEN": "GENERACIÓN",
      "NUM.P-MAC": "NUMÉRICO MAC",
      "NUM.PMAC": "NUMÉRICO MAC",
      "LAT": "LATINO AMERICANO",
      "PLA": "PLATA",
      "INGLES": "INGLES",
      "ESTADOU": "AMERICANO",
      "SOPORMNTR": "SOPORTE MONITOR",
      "ADAP": "ADAPTADOR",
      "C-cancelacion": "CANCELACIÓN",
      "GRI": "GRIS"
      // Agrega más abreviaturas según sea necesario
    };
  
    // Función para abreviar el texto
    const abreviarTexto = (textos) => {
      return textos.split(' ').map(word => abreviaturas[word] || word).join(' ');
    }

    // Abreviar el texto
    const textoAbreviado = abreviarTexto(texto);
  
    // Devolver el resultado
    return textoAbreviado;
}

  const procesarTexto = (texto) => {
    // Remover espacios dobles y punto final
    let textoProcesado = texto
  
    //Reemplazar APPLEWATCHSE y APPLEWATCH
    textoProcesado = textoProcesado.replace(/APPLEWATCHSE/g, "APPLE WATCH SE");
    textoProcesado = textoProcesado.replace(/APPLEWATCH/g, "APPLE WATCH");
    textoProcesado = textoProcesado.replace(/SERIES9/g, "SERIES 9");
    textoProcesado = textoProcesado.replace(/ULTRA2/g, "ULTRA 2");
    textoProcesado = textoProcesado.replace(/APPLEWATCHSE-/g, "APPLE WATCH SE");
    textoProcesado = textoProcesado.replace(/BEATSSTUDIOBUDSAURICULARES/g, "BEATS STUDIO BUDS AURICULARES")
    textoProcesado = textoProcesado.replace(/-TALLAS\/M/gi, "- Tallas S/M");
    textoProcesado = textoProcesado.replace(/-TALLASM\/L/gi, "- Tallas M/L");
    textoProcesado = textoProcesado.replace(/-TALLAM/gi, "- Talla M");
    textoProcesado = textoProcesado.replace(/-TALLAS/gi, "- Talla S");
    textoProcesado = textoProcesado.replace(/-TALLA/g, '');
    textoProcesado = textoProcesado.replace(/8N/gi, "8 Nucleos");
    textoProcesado = textoProcesado.replace(/10N/gi, "10 Nucleos");
    textoProcesado = textoProcesado.replace(/\s*SYST\s*/g, ' ');
    textoProcesado = textoProcesado.replace(/GRISESPACIA/g, 'Gris Espacial');
    textoProcesado = textoProcesado.replace(/BRICOS/g, '');
    textoProcesado = textoProcesado.replace(/TECLAWRLS/g, 'Teclado Inalámbrico')
    // textoProcesado = textoProcesado.replace(/NUM/g, 'Numérico');
    // textoProcesado = textoProcesado.replace(/NUMERICO/g, 'Numérico');
    textoProcesado = textoProcesado.replace(/11INCH/g, '11 in');
    textoProcesado = textoProcesado.replace(/ESPANOL LA/g, 'Español Latinoamericano');
    textoProcesado = textoProcesado.replace(/TECLAACCS/g, 'Tecla Accesorios')
    textoProcesado = textoProcesado.replace(/\bING\b/g, 'Ingles');
    textoProcesado = textoProcesado.replace(/\bINGLE\b/g, 'INGLES');
    textoProcesado = textoProcesado.replace(/\bSTD\b/g, 'Ingles');
    textoProcesado = textoProcesado.replace(/TE INCLINACION AJUSTABLE/g, 'CON INCLINACION AJUSTABLE');
    textoProcesado = textoProcesado.replace(/TE ALTURA INCLINACION AJUSTABLES/g, "Con Altura de Inclinacion Ajustable");
    textoProcesado = textoProcesado.replace(/ADAPTER-AME/g, "Adaptador Americano");
    textoProcesado = textoProcesado.replace(/TOTALLY WIRELESS/g, "Totalmente Inalambricos");
    textoProcesado = textoProcesado.replace(/\bSSD\s*32GB\s*R\b/g, "SSD 32G Ram");
    textoProcesado = textoProcesado.replace(/\bRAM\s*G\b/g, "RAM - GRIS ESPACIAL");
    textoProcesado = textoProcesado.replace(/\bGEN-BLANCO\b/g, "GENERACIÓN - BLANCO");
    textoProcesado = textoProcesado.replace(/\bGEN-NEGRO\b/g, "GENERACIÓN - NEGRO");
    textoProcesado = textoProcesado.replace(/\bGENBLANCO\b/g, "GENERACIÓN - BLANCO");
    textoProcesado = textoProcesado.replace(/\bESPLAT\b/g, "ESPAÑOL LATINO");
    textoProcesado = textoProcesado.replace(/\bAIR4A\b/g, "AIR 4A");
    textoProcesado = textoProcesado.replace(/\bWI-FI-PLATA\b/g, "WI-FI - PLATA");
    textoProcesado = textoProcesado.replace(/\bCABL\b/g, "CABLE");
    textoProcesado = textoProcesado.replace(/\bM1CHIP\b/g, "M1 CHIP");
    textoProcesado = textoProcesado.replace(/\bDEPWR\b/g, "DE");
    textoProcesado = textoProcesado.replace(/\bC-CANCELACION\b/g, "CANCELACION");
    textoProcesado = textoProcesado.replace(/\bPWR\b/g, "");
    textoProcesado = textoProcesado.replace(/\bEXT\b/g, "");
    textoProcesado = textoProcesado.replace(/\bAZABACHE\b/g, "– NEGRO AZABACHE");
    textoProcesado = textoProcesado.replace(/-F\b/g, "");
    textoProcesado = textoProcesado.replace(/\bCTRL\b/g, "CONTROLLER");
    textoProcesado = textoProcesado.replace(/\bFOR\b/g, "PARA");
        // New replacement for "XBOX SERIES"
    textoProcesado = textoProcesado.replace(/\bX\b/g, "");
    textoProcesado = textoProcesado.replace(/\bXBOX\s*SERIES\b/g, "XBOX SERIES");

    textoProcesado = textoProcesado.replace(/\bBLUE\s*CAMO\b/g, "BLUE CAMO - CAMOUFLAGE");

    textoProcesado = textoProcesado.replace(/\b1YR\b/g, "1 AÑO DE GARANTIA -");
    textoProcesado = textoProcesado.replace(/\b2YR\b/g, "2 AÑOS DE GARANTIA -");
    textoProcesado = textoProcesado.replace(/\b3YR\b/g, "3 AÑOS DE GARANTIA -");
    textoProcesado = textoProcesado.replace(/\b4YR\b/g, "4 AÑOS DE GARANTIA -");
    textoProcesado = textoProcesado.replace(/\b5YR\b/g, "5 AÑOS DE GARANTIA -");
    textoProcesado = textoProcesado.replace(/\bIRONWOLF\s*PR\b/g, "IRONWOLF PRO");

    return textoProcesado;
  }

  const Uppercase = (texto) => {
    let textoModificado = texto.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
        // Convertir a mayúsculas, excepto para "- Tallas S/M" y "Tallas M/L"
        return a === 'M/l' || a === 'S/m' ? a : a.toUpperCase();
      });


    return textoModificado
  }

  const AgregarMarcaTitulo = (texto, marca) => {
    let tituloMarca = ""

    if(marca === "APPLE"){
        // Si es así, prefijar el título con "Apple -"
        tituloMarca += "Apple - " + texto;
    }else

    return tituloMarca
  }
  
module.exports = { abreviarYTraducir, procesarTexto, Uppercase, AgregarMarcaTitulo}
  