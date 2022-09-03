import "url-search-params-polyfill";
import { getSearchParam } from "../../utils";

const isTouchDevice = () => {

	return navigator
		? "ontouchstart" in window ||
		// @ts-ignore-disable-next-line
		( window.DocumentTouch && document instanceof window.DocumentTouch ) ||
		navigator.maxTouchPoints ||
		false
		: false;

};

const debug = getSearchParam( "debug" );
const debugFPS = getSearchParam( "fps" );
const debugDrawCount = getSearchParam( "drawcount" );
const debugGui = getSearchParam( "gui" );
const debugControls = getSearchParam( "controls" );
const debugCamera = getSearchParam( "debugcamera" );

const glSettings = {
	USE_POSTPROCESS: true,
	DPI: 1,
	DEBUG_FPS: false || ( debug && debugFPS ),
	DEBUG_DRAW_COUNT: false || ( debug && debugDrawCount ),
	USE_ORBIT_CONTROLS: false || ( debug && debugControls ),
	USE_DEBUG_CAMERA: false || ( debug && debugCamera ),
	USE_GUI: false || ( debug && debugGui ),
};

const xrSettings = {};

export { isTouchDevice, glSettings, xrSettings };
