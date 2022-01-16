import gsap, { Power1, Power2 } from "gsap/gsap-core";

import { CSSPlugin } from "gsap/CSSPlugin";

gsap.registerPlugin( CSSPlugin );

export default {
	webgl: {},
	app: {
		logoTransition: ( input ) =>
			gsap.fromTo(
				input,
				{
					y: 20,
					opacity: 0,
				},
				{
					duration: 1.2,
					opacity: 1,
					y: 0,
					ease: Power1.easeOut,
					delay: 0.5,
				}
			),

		desktopEntryTransition: ( input ) =>
			gsap.fromTo(
				input,
				{
					opacity: 0,
					y: 10,
				},
				{
					y: 0,
					opacity: 1,
					duration: 1,
					delay: 1,
				}
			),

		pageEnterTransition: ( input, duration = 2, delay = 0, callback = null ) =>
			gsap.fromTo(
				input,
				{
					opacity: 0,
				},
				{
					opacity: 1,
					duration,
					delay,
					ease: Power2.easeOut,
					onComplete: () => {

						if ( callback ) {

							callback();

						}

					},
				}
			),

		pageExitTransition: ( input, root, callback, duration = 1.5 ) =>
			gsap.to( input, {
				opacity: 0,
				duration: duration,
				ease: Power1.easeOut,
				onComplete: () => {

					callback( input, root );

				},
			} ),
	},
};
