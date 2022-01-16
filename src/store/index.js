import { BehaviorSubject, Subject } from "rxjs";
import { ActionTypes } from "./actions";
import { state as defaultState } from "./presets";

let state = defaultState;

export const store = new BehaviorSubject( state );
export const eventDispatcher = new Subject();

eventDispatcher.subscribe( ( data ) => {

	switch ( data.type ) {

		case ActionTypes.UPDATE_GPU_TIER:
			state = {
				...state,
				device: {
					...state.device,
					gpuTier: data.payload,
				},
			};
			store.next( state );
			break;

		case ActionTypes.UPDATE_SCREEN:
			state = {
				...state,
				screen: data.payload,
			};
			store.next( state );
			break;

		case ActionTypes.ASSETS_LOADING:
			state = {
				...state,
				assetsLoading: data.payload,
			};
			store.next( state );
			break;

		case ActionTypes.UPDATE_MUTE:
			state = {
				...state,
				mute: data.payload,
			};
			store.next( state );
			break;

	}

} );

export const updateScreen = ( payload ) => {

	eventDispatcher.next( { type: ActionTypes.UPDATE_SCREEN, payload } );

};

export const updateMute = ( payload ) => {

	eventDispatcher.next( { type: ActionTypes.UPDATE_MUTE, payload } );

};

export const updateAssetsLoading = ( payload ) => {

	eventDispatcher.next( { type: ActionTypes.ASSETS_LOADING, payload } );

};

export const updateGPUTier = ( payload ) => {

	eventDispatcher.next( { type: ActionTypes.UPDATE_GPU_TIER, payload } );

};
