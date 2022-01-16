import World from "../worlds/World";

class Mediator {

	constructor() {

		this.world = World;

	}

	static getInstance() {

		if ( ! Mediator.instance ) Mediator.instance = new this();
		return Mediator.instance;

	}

}

export default Mediator;
