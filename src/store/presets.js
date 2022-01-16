import { ScreenTypes } from "@enums";
/**
 * Define initial state presets
 */

export const state = {
  screen: ScreenTypes.LOADING,
  assetsLoading: true,
  mute: false,
  device: {
    gpuTier: 3,
  },
};
