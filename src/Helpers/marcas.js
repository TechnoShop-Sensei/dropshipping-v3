const marcasSeleccionadasIngram = [
    "Acer",
    "Adesso",
    "Apple",
    "Adata",
    "Aruba",
    "ASUS",
    "Axis",
    "Acteck",
    "Barco",
    "Balam Rush",
    "BenQ",
    "Bixolon",
    "Brother",
    "Buffalo",
    "Canon",
    "CDP",
    "Comercializadora de Valor Agregado",
    "CyberPower",
    "Elo",
    "Epson",
    "GoPro",
    "Hisense",
    "Honeywell",
    "HP",
    "IOTZONE DC POS",
    "Kingston",
    "Koblenz",
    "Lenovo",
    "LG",
    "Linksys",
    "Logitech",
    "Microsoft",
    "Perfect Choice",
    "Naceb",
    "PERFORMANCE DESIGNED",
    "Plantronics",
    "Razer",
    "Samsung",
    "Schneider Electric",
    "StarTech",
    "Xiaomi",
    "Nexxt Home",
    "PlayStation",
    "AMD",
    "Intel",
    "StarTech.com",
    "Prolicom",
    "Otros",
    "Manhattan",
    "Intellinet",
    "Tribe",
    "VMWare",
    "Xerox",
    "Hewlett Packard",
    "Targus",
    "ELO TOUCH",
    "Techzone",
    "APC",
    "Dell",
    "Meraki",
    "Ingressio",
    "TP-LINK",
    "Star Micronics",
    "Google",
    "Seagate",
    "Trendnet",
    "Thermaltake",
    "Corsair",
    "SeguridadFísica",
    "Cisco Systems",
    "Konica Minolta",
    "Sharp",
    "Dataproducts",
    "Lexmark",
    "InFocus",
    "ViewSonic",
    "McAfee",
    "Kensington",
    "Sony",
    "3M",
    "LG Electronics",
    "EC Line",
    "Complet",
    "Zebra Technologies",
    "Silimex",
    "Viastara",
    "Unitech Electronics",
    "Wacom",
    "Ergotron",
    "VICA Digital Power",
    "TRIPPLITE",
    "KASPERSKY",
    "DATALOGIC",
    "Schneider It",
    "Ct",
    "Smartbitt",
    "HP INC",
    "Seguridad",
    "GHIA",
    "Vorago",
    "MSI COMPUTER",
    "Compulocks",
    "Poly",
    "IRIS",
    "VERBATIM",
    "Oster",
    "PAYCLIP",
    "NINTENDO",
    "VERTIV",
    "NOKIA",
    "GIGABYTE",
    "Hewlett Packard Enterprise",
    "Excaser",
    "CISCO",
    "Zebra",
    "MyBusiness POS",
    "AOC",
    "Printronix",
    "Aruba",
    "Xzeal Gaming",
    "Gaming",
    "Harman Gaming",
    "Cooler Master",
    "Yeyian",
    "Game Factor",
    "PNY",
    "AUTODESK",
    "MASTER CHOICE",
    "Whirlpool",
    "SANSUI",
    "Alcatel",
    "LACIE",
    "PROVISION ISR",
    "Mobile EDGE",
    "EPIK ONE",
    "EVGA",
    "SCREENBEAM",
    "NEXXT SOLUTIONS",
    "BROBOTIX",
    "JABRA",
    "Elo",
    "Unitech",
    "Vica",
    "HARMAN",
    "Xzeal",
    "Kodak",
    "OTHER",
    "QIAN",
    "Smart Home",
    "HYUNDA",
    "Wenger",
    "GETTECH",
    "COMERCIALIZADORA DE VALOR AGREGADO",
    "NUTANIX",
    "Schneider",
    "TMCELL",
    "AM DENMAK",
    "HP IMPRESIÓN",
    "Peerless",
    "Servicio de Instalación",
    "Ltb",
    "Edubytes",
    "Rodin Xp Pen",
    "AIS",
    "HANWHA TECHWIN",
    "PERFORMANCE DESIGNED",
    "Lenovo DCG",
    "INTEL (A)",
    "PP OTHER",
    "MICROSOFT SURFACE",
    "Dell Enterprise",
    "Sylus",
    "Kobo",
    "Seguridad Física",
    "Naceb Gaming",
    "Schneider Electric",
    "ARROBA",
    "EZVIZ",
    "TJD",
    "ISB SOLA BASIC",
    "KINGSTON FLASH",
    "XP PEN",
    "SYNERGEX DE MEXICO SA DE CV",
    "ARROBA COMPUTERS DISTRIBUCION S.A.",
    "LINKSYS USA, INC.",
    "MICROSOFT MONTHLY-ANNUAL (NCE)",
    "Barco",
    "MEIZHOU GUO WEI",
    "WatchGuard",
    "AUDIO PRO",
    "Kingston SSD",
    "Bullitt",
    "Kingston Server",
    "IOTZONE DC POS",
    "IMPRESORAS ZEBRA",
    "Hyundai (SWTS)",
    "P&P Retail",
    "MSI",
    "Me",
    "Samsung Retail",
    "PNY (SWTS)",
    "Blam Rush",
    "South American Sales De México",
    "GO TO",
    "Probotix",
    "Gigabyte Hardware",
    "Kingston Ap Ssd",
    "Kingston AP flash",
    "Smile Market",
    "Dell NPOS",
    "Components (SWTS)",
    "Honor Technologies",
    "ACTUALIZACIONES PARA COMPUTADORAS",
    "SWTS DIRECT S. DE R.L. DE C.V.",
    "Cnp Enterprise",
    "Xerox Hw Xmex",
    "Logitech Warranty",
    "Macro Electro",
    "Vorago Accs",
    "Vector Engineering",
    "Lenovo Global",
    "Datalogic Usa",
    "Apple Hw Mac",
    "Zebra Tech.",
    "Lenovo Notebook Usd",
    "Hpe Proyectos",
    "Epson Pos",
    "Lenovo Idea Nb",
    "Lenovo Idea Aio",
    "Xerox Hw A3 Mono",
    "Xerox Hw A4 Mono",
    "Xerox Hw A4 Color",
    "Xpg Hardware",
    "Samsung Tab Mxp",
    "Hpe Aruba Rr Mxp",
    "Dropbox Trad",
    "Lexmark Supplies",
    "Microsoft Teams Month",
    "Microsoft Cmp Aa Nce",
    "GRUPO DESDEMONA S DE RL DE CV",
    "JUNIPER NETWORKS INC",
    "HP Hyperx",
    "Canon Supplies",
    "Xerox Supp A4 Mono",
    "Xerox Supp A3 Color",
    "Hp Inc. Proyectos",
    "Xerox Hw A3 Color",
    "Respuestas Optimas",
    "Swiss Mobility",
    "DELSEY",
    "Zebra Printers",
    "Lenovo Thinkcentre",
    "Naceb Consignacion",
    "TechZone DC POS",
    "Hpe Costo Cero Rr",
    "Mcafee Llc",
    "Hp Inc Proyectos Mb",
    "Tecnosinergia",
    "Hisense Laser Tv",
    "Dell Networking",
    "Honeywell Proyectos",
    "Tanium Malta Limited Cloud",
    "Dell APOS",
    "Acer Movilidad",
    "Hid Global",
    "Adobe Trad",
    "Getttech",
    "Panasonic",
    "Musarubra",
    "Wacom Retail"
  ];
  
module.exports = marcasSeleccionadasIngram