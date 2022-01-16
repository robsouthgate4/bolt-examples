import { store } from "@store";
import gsap, { Linear } from "gsap/gsap-core";
import transitionsConfig from "@config/transitions";
import Screen from "./Screen";
import { Power1 } from "gsap/all";

export default class Experience extends Screen {

	constructor( { name } ) {

		super( { name } );

		this.name = name;
		this.canvas = document.getElementById( "experience" );
		this.root = "";
		this.localState = {
			scrollPercent: 0,
		};

		this.currentState = {
			scrollProgess: 0,
		};

	}

	generateHTML( root ) {

		this.container = this.getContainer();
		const htmlString = `
    `;
		this.container.innerHTML = htmlString;
		root.appendChild( this.container );

		this.initListeners();

		return this.container;

	}

	initListeners() {

		this.scrollProgressBar = document.querySelector( ".scroll-progress" );
		store.subscribe( ( state ) => {

			if ( state.scrollProgress !== this.currentState.scrollProgress ) {

				this._handleScrollUpdate( state.scrollProgress );

			}

			this.currentState = state;

		} );

	}

	_handleScrollUpdate( progress ) {

		gsap.to( this.localState, {
			scrollPercent: progress,
			duration: 0.5,
			ease: Power1.easeOut,
			onUpdate: () => {

				this.scrollProgressBar.style.width = `${
					this.localState.scrollPercent || 0
				}%`;

			},
		} );

	}

	async onEnter( root ) {

		this.root = root;

		this.generateHTML( root );

		// fade in canvas
		const fadeInCanvasTransition = gsap.to( this.canvas, {
			opacity: 1,
			duration: 0.25,
			ease: Linear,
		} );

		const pageEnterTransition = transitionsConfig.app.pageEnterTransition(
			this.container,
			2,
			0
		);

		this.transitions.push( pageEnterTransition, fadeInCanvasTransition );

	}

}
