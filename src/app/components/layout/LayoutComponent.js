export default class LayoutComponent {

	constructor( { injectPosition, screenEnter, screenExit } ) {

		this.screenEnter = screenEnter || null;
		this.screenExit = screenExit || null;

		this.injectPosition = injectPosition;

		this.attached = false;

		this.events = [];
		this.transitions = [];

		if ( new.target === Screen ) {

			throw new TypeError( "Cannot construct Abstract instances directly" );

		}

	}

	cleanUp( layoutEl, root ) {

		root.removeChild( layoutEl );
		if ( this.events.length > 0 ) {

			this.events.forEach( ( subscription ) => subscription.unsubscribe() );

		}

		if ( this.transitions.length > 0 ) {

			this.transitions.forEach( ( transition ) => transition.kill() );

		}

	}

	initListeners() {}

	onEnter() {}

	onExit() {}

}
