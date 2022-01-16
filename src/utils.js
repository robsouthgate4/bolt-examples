export const getClassFromString = (name) => `.${name.replace(/_/g, "-")}`;

export const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const fit = (value, low1, high1, low2, high2) => {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
};

export const bellCurve = (value) => {
  return (Math.sin(2 * Math.PI * (value - 0.2)) + 1) / 2;
};

export const lerp = (v0, v1, t) => {
  return v0 * (1 - t) + v1 * t;
};

export const hexToRgb = (hex) => {
  let result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const strToBool = (s) => {
  const regex = /^\s*(true|1|on)\s*$/i;
  return regex.test(s);
};

export const getSearchParam = (param) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const paramType = urlParams.has(param);
  return urlParams.has("debug") && paramType;
};

export const isIOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isChrome = () => /CriOS/i.test(navigator.userAgent);

export const isFirefoxIOS = () => navigator.userAgent.match("FxiOS");

export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (!!window.MSInputMethodContext && !!document.documentMode) {
    // ie11
    return "desktop";
  }
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

export const getTextureMapData = (heightmap) => {
  const { image } = heightmap;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData;
};

export const getTexturePixelValue = (imageData, coordinate) => {
  const { x, y } = coordinate;
  const position = (x + imageData.width * y) * 4;
  const data = imageData.data;
  const colorValue = {
    r: data[position] / 255,
    g: data[position + 1] / 255,
    b: data[position + 2] / 255,
    a: data[position + 3] / 255,
  };
  return colorValue;
};

export const loadAudioBuffer = (url, audioContext) => {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => {
      audioContext.decodeAudioData(
        request.response,
        function (buffer) {
          resolve(buffer);
        },
        reject
      );
    };
    request.send();
  });
};

export const loadBinaryBuffer = (url) => {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => {
      resolve(request.response);
    };
    request.onerror = (err) => {
      reject(err);
    };
    request.send();
  });
};

export const asyncLoader = (url, loader, params = {}) => {
  return new Promise((resolve) => {
    let { dracoLoader } = params;
    if (dracoLoader) {
      dracoLoader.setDecoderConfig({ type: "js" });
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      loader.setDRACOLoader(dracoLoader);
    }
    loader.load(url, (data) => {
      if (dracoLoader) {
        dracoLoader.dispose();
      }
      return resolve(data);
    });
  });
};
