import { store } from "@store";
import { ScreenTypes } from "@enums";
import { fromEvent } from "rxjs";
import { getClassFromString } from "../utils";
import { updateScreen } from "../store";
import Experience from "./screens/Experience";
import RotateDevice from "./components/layout/RotateDevice";

export default class App {
  constructor() {
    this.uiHTMLContainer = document.getElementById("ui");
    this.uiHTMLContainer.style.display = "none";

    updateScreen(ScreenTypes.LOADING);

    this.screens = [];
    this.layoutComponents = [];
    this.currentState = {};
    this.localState = {};

    fromEvent(window, "click").subscribe(() => {});
  }

  init() {
    this.initLayoutComponents();
    this.initScreens();
    store.subscribe((state) => {
      this.handleStateUpdate(state);
      this.currentState = state;
    });
  }

  initLayoutComponents() {
    const rotateDevice = new RotateDevice({
      screenEnter: ScreenTypes.LOADING,
      injectPosition: "afterbegin",
    });
    this.layoutComponents.push(rotateDevice);
  }

  initScreens() {
    this.screens.push(new Experience({ name: ScreenTypes.EXPERIENCE }));
    fromEvent(window, "resize").subscribe(() => {
      this.screens.forEach((screen) => screen.onResize());
    });
  }

  handleStateUpdate(state) {
    // only update screen and layouts if screen state is new
    if (this.currentState.screen !== state.screen) {
      this.runScreenTransitions(state);
      this.runLayoutTransitions(state);
    }
  }

  runLayoutTransitions(state) {
    this.layoutComponents.forEach((layoutComponent) => {
      if (layoutComponent.screenEnter === state.screen) {
        layoutComponent.onEnter(this.uiHTMLContainer);
      }
      if (layoutComponent.screenExit === state.screen) {
        layoutComponent.onExit(this.uiHTMLContainer);
      }
    });
  }

  runScreenTransitions(state) {
    this.screens.forEach((screen) => {
      const screenEl = document.querySelector(
        `${getClassFromString(screen.name)}`
      );
      if (screen.name === state.screen) {
        screen.active = true;
        screen.onEnter(this.uiHTMLContainer);
      } else {
        if (screen.active) {
          screen.onExit(screenEl, this.uiHTMLContainer);
        }
        screen.active = false;
      }
    });
  }
}
