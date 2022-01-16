import { glSettings } from "@webgl/globals/Constants";
import * as stats from "stats.js";
import {
  glEarlyUpdateTopic,
  glLateUpdateTopic,
  glUpdateTopic,
} from "@pubSub/constants";
import { publish } from "@pubSub";

import EventListeners from "./globals/EventListeners";

const { DEBUG_FPS, USE_ORBIT_CONTROLS } = glSettings;

export default class Base extends EventListeners {
  constructor() {
    super();

    this.isRunning = false;
    this.requestFrame = null;
    this.elapsed = null;

    this.mouse = {};

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (DEBUG_FPS) {
      this.stats = new stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.dom);
    }

    if (USE_ORBIT_CONTROLS) {
      this.controls = null;
      this.initControls();
      document.getElementById("ui").style.pointerEvents = "none";
    }

    document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" ? this.start() : this.pause();
    });
  }

  start() {
    this.isRunning = true;
    this.run();
  }

  initControls() {}

  pause() {
    if (this.requestFrame) {
      cancelAnimationFrame(this.requestFrame);
      this.requestFrame = null;
    }
    this.isRunning = false;
  }

  earlyUpdate(elapsed, delta) {
    publish(glEarlyUpdateTopic, { elapsed, delta });
  }

  update(elapsed, delta) {
    publish(glUpdateTopic, { elapsed, delta });
  }

  lateUpdate(elapsed, delta) {
    publish(glLateUpdateTopic, { elapsed, delta });
  }

  run() {
    const { DEBUG_FPS } = glSettings;

    const delta = 0;
    this.elapsed = 0;

    this.earlyUpdate(this.elapsed, delta);
    this.update(this.elapsed, delta);
    this.lateUpdate(this.elapsed, delta);

    if (DEBUG_FPS) this.stats.end();

    if (this.isRunning) {
      this.requestFrame = requestAnimationFrame(this.run.bind(this));
    }
  }
}
