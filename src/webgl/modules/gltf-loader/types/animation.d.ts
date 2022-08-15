import { quat, vec3 } from "gl-matrix";

/**
 * Root for each animation
 */
export interface Animation {
    [name: string]: Channel;
}

/**
 * List of keyframes for each animation
 */
export interface Channel {
    [key: number]: Transform;
}

/**
 * Animation keyFrames
 */
export interface Transform {
    translation: KeyFrame[];
    rotation: KeyFrame[];
    scale: KeyFrame[];
}

/**
 * Transform executed at specific time.
 */
export interface KeyFrame {
    time: number;
    transform: vec3 | quat;
    type: 'translation' | 'rotation' | 'scale';
}
