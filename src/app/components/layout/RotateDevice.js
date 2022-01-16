import { fromEvent } from "rxjs";
import LayoutComponent from "./LayoutComponent";
import { logoString } from "@app/includes/logo";

export default class RotateDevice extends LayoutComponent {

	constructor( { injectPosition, screenEnter, screenExit } = {} ) {

		super( { injectPosition, screenEnter, screenExit } );
		this.appState = {};

	}

	generateHTML( root ) {

		this.container = document.createElement( "div" );
		this.container.classList.add( "rotate-device" );

		const htmlString = `
        ${logoString()}
        <div class="inner-container">
            <span><img src="static/images/icon-portrait.svg" alt="Rotate device"></span>
            <h2>Rotate your device</h2>
            <p>Please keep your phone in portrait mode</p>
        </div>
        `;

		this.container.innerHTML += htmlString;
		root.insertAdjacentElement( this.injectPosition, this.container );

		this.initListeners();

	}

	initListeners() {

		this.logoClick = fromEvent( this.container.querySelector( ".logo" ), "click" );

		const logoClickObservable$ = this.logoClick.subscribe( () => {

			window.gtag( "event", "click", {
				event_category: "button",
				event_label: "header logo",
			} );

		} );

		this.events.push( logoClickObservable$ );

	}

	onEnter( root ) {

		if ( this.attached ) return;
		this.generateHTML( root );
		this.attached = true;

	}

	onExit( root ) {

		this.attached = false;
		this.cleanUp( this.container, root );

	}

}
