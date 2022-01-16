import { updateScreen, store } from "@store";
import { ScreenTypes } from "@enums";
import { animationFrameScheduler, interval } from "rxjs";
import { lerp } from "@/utils";
import transitionsConfig from "@/config/transitions";
import htmlString from "./templates/loading";
import Screen from "./Screen";
import AssetManager from "@asset-manager/core";
import assets from "../../config/assets";

export default class Loading extends Screen {
  constructor({ name }) {
    super({ name });
    this.delayNextScreenTime = 2000;
    this.loadingBarProgress = "";
    this.progressTransition = null;
    this.loadingAnimationTime = 5;
    this.assetManager = AssetManager.getInstance();
    this.appState = {};
    this.loading = { current: 0, new: 0 };
  }

  generateHTML(root) {
    const container = this.getContainer();
    container.innerHTML = htmlString;
    root.appendChild(container);
    this.initListeners();
    return container;
  }

  initListeners() {
    this.loadingBarProgress = document.querySelector(".loading-bar-progress");

    store.subscribe((state) => {
      this.handleStateUpdate(state);
      this.appState = state;
    });

    this.assetManager.onPreloadProgress.subscribe((progress) => {
      const progressPercent = progress * 100;
      this.loading.new = progressPercent;
    });

    if (assets.length === 0) {
      this.loading.new = 100;
      setTimeout(() => {
        updateScreen(ScreenTypes.EXPERIENCE);
      }, this.delayNextScreenTime);
    } else {
      this.assetManager.onPreloaded.subscribe(() => {
        setTimeout(() => {
          updateScreen(ScreenTypes.EXPERIENCE);
        }, this.delayNextScreenTime);
      });
    }

    const rxLoop$ = interval(0, animationFrameScheduler).subscribe(() => {
      this.loading.current = lerp(this.loading.current, this.loading.new, 0.03);
      this.loadingBarProgress.style.width = this.loading.current + "%";
    });

    this.events.push(rxLoop$);
  }

  handleStateUpdate() {}

  onEnter(root) {
    const container = this.generateHTML(root);

    const pageEnterTransition =
      transitionsConfig.app.pageEnterTransition(container);

    this.transitions.push(pageEnterTransition);
  }

  onExit(screenEl, root) {
    const exitAnim = transitionsConfig.app.pageExitTransition(
      screenEl,
      root,
      this.cleanUp.bind(this)
    );
    this.transitions.push(exitAnim);
  }
}
