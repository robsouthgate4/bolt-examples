import { fromEvent } from "rxjs";
import { updateMute, store, updateScreen } from "@store";
import { ScreenTypes } from "@enums";

import LayoutComponent from "./LayoutComponent";
import transitionsConfig from "@/config/transitions";

export default class Header extends LayoutComponent {

	constructor( { injectPosition, screenEnter, screenExit } = {} ) {

		super( { injectPosition, screenEnter, screenExit } );

		this.muteToggle = null;
		this.shopCollectionToggle = null;
		this.currentState = {
			screen: ScreenTypes.NONE,
		};

	}

	generateHTML( root ) {

		this.container = document.createElement( "header" );

		const htmlString = `
      <button class="mute-button muted"></button>
      <a class="logo" href="https://www.phantom.land" target="_blank">
        <img src="static/images/phntm-logo-invert.svg" alt="phantom logo" />
      </a>
      <div class="header-buttons">
        <button class="info-button"></button>
      </div>
    `;

		this.container.innerHTML += htmlString;
		root.insertAdjacentElement( this.injectPosition, this.container );

		this.initListeners();

	}

	initListeners() {

		this.muteToggle = this.container.querySelector( ".mute-button" );
		this.infoButtonToggle = this.container.querySelector( ".info-button" );

		this.logoClick = fromEvent( this.container.querySelector( ".logo" ), "click" );

		const logoClickObservable$ = this.logoClick.subscribe( () => {

			window.gtag( "event", "click", {
				event_category: "button",
				event_label: "header logo",
			} );

		} );

		const infoToggleObservable$ = fromEvent(
			this.infoButtonToggle,
			"click"
		).subscribe( () => {

			this.handleInfoToggle();

		} );

		const soundToggleObservable$ = fromEvent(
			this.muteToggle,
			"click"
		).subscribe( () => {

			this.handleMuteToggle();

		} );

		this.events.push(
			soundToggleObservable$,
			infoToggleObservable$,
			logoClickObservable$
		);

		// get initial state
		store.subscribe( ( state ) => {

			this.handleStateUpdate( state );
			this.currentState = state;

		} );

	}

	handleStateUpdate( state ) {

		const { mute } = state;
		this.updateSoundIcon( mute );
		this.runHeaderTransition( state );

	}

	runHeaderTransition( state ) {

		if ( ! this.currentState.screen ) return;
		if (
			state.screen === ScreenTypes.EXPERIENCE &&
      this.currentState.screen === ScreenTypes.INFO
		) {

			transitionsConfig.app.layoutHeaderTransition( this.container, 1 );

		}

	}

	updateSoundIcon( mute ) {

		mute
			? this.muteToggle.classList.add( "muted" )
			: this.muteToggle.classList.remove( "muted" );

	}

	handleInfoToggle() {

		updateScreen( ScreenTypes.INFO );

	}

	handleMuteToggle() {

		updateMute( ! this.currentState.mute );

	}

	onEnter( root ) {

		if ( this.attached ) return;

		this.generateHTML( root );
		transitionsConfig.app.layoutHeaderTransition( this.container );
		this.attached = true;

	}

	onExit( root ) {

		this.attached = false;
		this.cleanUp( this.container, root );

	}

}
