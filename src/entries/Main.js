import Mediator from "@webgl/globals/Mediator";
import { getGPUTier } from "detect-gpu";
import { updateGPUTier } from "@store";
import { updateAssetsLoading } from "@store";
import assets from "@config/assets";
import App from "@/app";

import appConfig from "@config/app";

export default class Main {

	constructor() {

		this.mediator = Mediator.getInstance();
		this.world = null;
		this.loading = false;

		this._start();

	}
	_start() {

		this.world = new this.mediator.world();
		this.world.start();
		window.addEventListener( "resize", () => {

			this.world.resize( );

		} );
		updateAssetsLoading( false );

	}

	init() {

		// send the device gpu tier to the store
		( async () => {

			const gpuTier = await getGPUTier();
			const { tier } = gpuTier;
			updateGPUTier( tier );

		} )();

		const app = new App( this.assetManager );
		app.init();

	}

}
