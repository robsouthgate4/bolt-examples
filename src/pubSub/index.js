import { Subject } from "rxjs";
import { filter, map } from "rxjs/operators";

export const viewTopic = "view topic";

export const mainSubject = new Subject();

export const publish = ( topic, data ) => {

	mainSubject.next( { topic, data } );

};

export const listen = ( topic, callback ) => {

	mainSubject
		.pipe(
			filter( ( f ) => f.topic === topic ),
			map( ( d ) => d.data )
		)
		.subscribe( callback );

};
