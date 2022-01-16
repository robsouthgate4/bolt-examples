import Hammer from "hammerjs";
import { publish } from "@pubSub";
import { isTouchDevice } from "@webgl/globals/Constants";
import {
  glWheelTopic,
  glTouchEndTopic,
  glTouchMoveTopic,
  glTouchStartTopic,
  glLongPressTopic,
  glLongPressTopicUp,
  glSwipeUpTopic,
  glSwipeDownTopic,
  glPinchTopic,
  glTapTopic,
  glPanEndTopic,
  glResizeTopic,
  glPanTopic,
} from "@pubSub/constants";

export default class EventListeners {
  constructor() {
    this._createListeners();
  }

  _createListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    if (isTouchDevice()) {
      window.addEventListener("touchstart", this.onTouch.bind(this));
      window.addEventListener("touchend", this.onTouchEnd.bind(this));
      window.addEventListener("touchmove", this.onMouseMove.bind(this));

      const mc = new Hammer.Manager(document.body);

      const pinch = new Hammer.Pinch();
      const longPress = new Hammer.Press();
      const tap = new Hammer.Tap();
      const pan = new Hammer.Pan();

      pan.set({
        direction: Hammer.DIRECTION_VERTICAL,
        threshold: 1,
        velocity: 0.1,
      });

      mc.add([pinch, longPress, pan, tap]);

      mc.on("tap", (evt) => {
        const data = {
          normalized: {
            x: (evt.center.x / this.width) * 2 - 1,
            y: -(evt.center.y / this.height) * 2 + 1,
          },
          raw: {
            x: evt.center.x,
            y: evt.center.y,
          },
          rawNormalized: {
            x: (evt.center.x - this.width * 0.5) * 2,
            y: (evt.center.y - this.height * 0.5) * 2,
          },
        };
        publish(glTapTopic, data);
      });

      mc.on("pinch", (evt) => {
        publish(glPinchTopic, evt);
      });

      mc.on("press", (evt) => {
        publish(glLongPressTopic, evt);
      });

      mc.on("pressup", (evt) => {
        publish(glLongPressTopicUp, evt);
      });

      mc.on("panmove", (evt) => {
        publish(glPanTopic, evt);
      });

      mc.on("pandown panup panend", (evt) => {
        let swiping = false;

        if (evt.type === "panend") {
          if (evt.velocityY < -0.3 && evt.distance > 10) {
            swiping = true;
            if (evt.angle < -60 && evt.angle > -120) {
              publish(glSwipeUpTopic, evt);
            }
          }
          if (evt.velocityY > 0.3 && evt.distance > 10) {
            swiping = true;
            if (evt.angle > 60 && evt.angle < 120) {
              publish(glSwipeDownTopic, evt);
            }
          }

          if (!swiping) {
            publish(glPanEndTopic, evt);
          }
        }
      });
    } else {
      window.addEventListener("mousedown", this.onTouch.bind(this));
      window.addEventListener("mouseup", this.onTouchEnd.bind(this));
      window.addEventListener("mousemove", this.onMouseMove.bind(this));
      window.addEventListener("wheel", this.onWheel.bind(this));
    }
  }

  removeListeners() {
    if (isTouchDevice()) {
      window.removeEventListener("touchstart", this.onPress.bind(this));
      window.removeEventListener("touchend", this.onPress.bind(this));
      window.removeEventListener("touchmove", this.onPressMove.bind(this));
    } else {
      window.removeEventListener("mousedown", this.onPress.bind(this));
      window.removeEventListener("mouseup", this.onPress.bind(this));
      window.removeEventListener("mousemove", this.onPressMove.bind(this));
      window.removeEventListener("wheel", this.onWheel.bind(this));
    }
    window.removeEventListener("resize", this.onResize.bind(this));
  }

  onTouch(ev) {
    console.log("clicked");
    this.mouse = this.getMouse(ev);
    publish(glTouchStartTopic, this.mouse);
  }

  onTouchEnd(ev) {
    this.mouse = this.getMouse(ev);
    publish(glTouchEndTopic, this.mouse);
  }

  onWheel(ev) {
    publish(glWheelTopic, {
      deltaY: ev.deltaY,
      deltaX: ev.deltaX,
      direction: Math.sign(ev.deltaY),
    });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    publish(glResizeTopic);
  }

  onMouseMove(ev) {
    if (ev.touches) {
      if (ev.touches.length > 1) {
        return;
      }
    }

    ev.preventDefault();
    ev.stopPropagation();

    this.mouse = this.getMouse(ev);
    publish(glTouchMoveTopic, this.mouse);
  }

  getMouse(ev) {
    if (ev.changedTouches) {
      ev = ev.changedTouches[0];
    }

    return {
      normalized: {
        x: (ev.clientX / this.width) * 2 - 1,
        y: -(ev.clientY / this.height) * 2 + 1,
      },
      raw: {
        x: ev.clientX,
        y: ev.clientY,
      },
      rawNormalized: {
        x: (ev.clientX - this.width * 0.5) * 2,
        y: (ev.clientY - this.height * 0.5) * 2,
      },
    };
  }
}
