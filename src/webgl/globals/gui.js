import GUI from "lil-gui";

export const gui = new GUI();

export const download = (data, filename = "settings", type = "txt") => {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
};

import { glSettings } from "@webgl/globals/Constants";

if (!glSettings.USE_GUI) {
  gui.close();
  //gui.destroy();
}
