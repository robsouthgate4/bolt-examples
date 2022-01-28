import Transform from "./Transform";

export default class Entity {

	constructor() {

		this.transform = new Transform();

		this.children = [];
		this.parent = null;

	}

	addChild( { entity } ) {

		entity.paren = this;
		this.children.push( entity );

	}

}
