export default class Screen {
  constructor({ name = "", additionalClasses = [] }) {
    this.name = name;
    this.active = false;
    this.events = [];
    this.transitions = [];
    this.transitionRunning = false;
    this.additionalClasses = additionalClasses;
    if (new.target === Screen) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }

  getContainer() {
    const node = document.createElement("div");
    node.classList.add(
      ...["screen", this.name.replace(/_/g, "-")],
      ...this.additionalClasses
    );
    return node;
  }

  cleanUp(screenEl, root) {
    root.removeChild(screenEl);
    if (this.events.length > 0) {
      this.events.forEach((subscription) => subscription.unsubscribe());
      this.events = [];
    }
    if (this.transitions.length > 0) {
      this.transitions.forEach((transition) => {
        // kill completed transitions
        transition.seek(transition.vars.duration);
        transition.kill();
      });
      this.transitions = [];
    }
  }

  initListeners() {}

  initTransitions() {}

  onResize() {}

  onEnter() {}

  onExit() {}
}
