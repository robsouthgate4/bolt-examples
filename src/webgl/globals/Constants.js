import "url-search-params-polyfill";
import { getSearchParam } from "../../utils";

const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    navigator.msMaxTouchPoints ||
    false
  );
};

const debug = getSearchParam("debug");
const debugFPS = getSearchParam("fps");
const debugDrawCount = getSearchParam("drawcount");
const debugGui = getSearchParam("gui");
const debugControls = getSearchParam("controls");

const glSettings = {
  USE_POSTPROCESS: true,
  DEBUG_FPS: false || (debug && debugFPS),
  DEBUG_DRAW_COUNT: false || (debug && debugDrawCount),
  USE_ORBIT_CONTROLS: false || (debug && debugControls),
  USE_GUI: false || (debug && debugGui),
  USE_XR: typeof XR != "undefined" ? true : false,
};

const xrSettings = {};

export { isTouchDevice, glSettings, xrSettings };
