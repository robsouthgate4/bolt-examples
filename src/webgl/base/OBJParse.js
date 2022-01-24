export default class OBJParse {

	constructor( src ) {

		this.src = src;

		this.vertices = [];
		this.indices = [];


	}

	async load( src ) {

		const file = await this.fetchFile( src );
		return this.getBuffers( file );

	}

	async fetchFile( ) {

		return new Promise( ( resolve, reject ) => {

			var request = new XMLHttpRequest();
			request.open( "GET", this.src, true );
			request.responseType = "text";
			request.onload = () => {

				resolve( request.response );

			};

			request.onerror = ( err ) => {

				reject( err );

			};

			request.send();

		} );

	}

	getBuffers( file ) {

		file.split( '\n' ).forEach( line => {

			if ( line.startsWith( 'v ' ) ) {

				this.vertices.push( ...this.parseVec( line, 'v ' ) );

			}

			if ( line.startsWith( 'f ' ) ) {

				this.indices.push( ...this.parseFace( line ).map( face => face[ 0 ] - 1 ) );

			}

		} );

		return {
			vertices: new Float32Array( this.vertices ),
			indices: new Uint8Array( this.indices )
		};

	}

	parseVec( string, prefix ) {

		return string.replace( prefix, '' ).split( ' ' ).map( Number );

	}

	parseFace( string ) {

		return string.replace( 'f ', '' ).split( ' ' ).map( chunk => {

			return chunk.split( '/' ).map( Number );

		} );

	}



}
