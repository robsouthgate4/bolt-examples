
import World from "@/webgl/worlds/WorldInstanced";

export default class Main {

  world!: World;
  loading: boolean;

  constructor() {

  	this.loading = false;
  	this._start();

  }
  _start() {

  	this.world = new World();
  	this.world.start();
  	window.addEventListener( "resize", () => {

  		this.world.resize( );

  	} );

  }

}
