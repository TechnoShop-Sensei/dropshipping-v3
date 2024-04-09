
const estadosSwitch = (Estado) => {
    let state = Estado.toUpperCase();

    switch (state) {
      case "AGU":
        state = "AG";
        break;
      case "BCN":
        state = "BN";
        break;
      case "BCS":
        state = "BS";
        break;
      case "CAM":
        state = "CA";
        break;
      case "CMX":
        state = "CM";
        break;
      case "CHS":
        state = "CS";
        break;
      case "CHH":
        state = "CH";
        break;
      case "COA":
        state = "CO";
        break;
      case "COL":
        state = "CL";
        break;
      case "DUR":
        state = "DU";
        break;
      case "MEX":
        state = "ME";
        break;
      case "GUA":
        state = "GU";
        break;
      case "GRO":
        state = "GR";
        break;
      case "HID":
        state = "HI";
        break;
      case "JAL":
        state = "JA";
        break;
      case "MIC":
        state = "MI";
        break;
      case "MOR":
        state = "MO";
        break;
      case "NAY":
        state = "NA";
        break;
      case "NLE":
        state = "NL";
        break;
      case "OAX":
        state = "OA";
        break;
      case "PUE":
        state = "PU";
        break;
      case "QUE":
        state = "QU";
        break;
      case "ROO":
        state = "RO";
        break;
      case "SLP":
        state = "SL";
        break;
      case "SIN":
        state = "SI";
        break;
      case "SON":
        state = "SO";
        break;
      case "TAB":
        state = "TB";
        break;
      case "TAM":
        state = "TM";
        break;
      case "TLA":
        state = "TL";
        break;
      case "VER":
        state = "VE";
        break;
      case "YUC":
        state = "YU";
        break;
      case "ZAC":
        state = "ZA";
        break;
      default:
        state = "CM";
    }
    return state;
}

module.exports = estadosSwitch