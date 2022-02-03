
export interface GLTFBufferObject {
  positions: Float32Array,
  uvs: Float32Array,
  normals: Float32Array,
  indices: Uint16Array,
}

export default class GLTFParser {

  url: string;

  constructor( url: string ) {

  	this.url = url;

  }

  async loadGLTF() {

  	const gltf = await ( await fetch( this.url ) ).json();
  	const bin = await this._loadBinaryBuffer( `/static/models/gltf/${gltf.buffers[ 0 ].uri}` ) as ArrayBufferLike;

  	const positionAccessorId = gltf.meshes[ 0 ].primitives[ 0 ].attributes.POSITION;

  	if ( gltf.accessors[ positionAccessorId ].componentType != 5126 ) {

  		return null;

  	}

  	const positionBufferViewID = gltf.accessors[ positionAccessorId ].bufferView;

  	const positions = new Float32Array(
  		bin,
  		gltf.bufferViews[ positionBufferViewID ].byteOffset,
  		gltf.bufferViews[ positionBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT );

  	const uvAccessorId = gltf.meshes[ 0 ].primitives[ 0 ].attributes.TEXCOORD_0;

  	if ( gltf.accessors[ uvAccessorId ].componentType != 5126 ) {

  		return null;

  	}

  	const uvBufferViewID = gltf.accessors[ uvAccessorId ].bufferView;

  	const uvs = new Float32Array(
  		bin,
  		gltf.bufferViews[ uvBufferViewID ].byteOffset,
  		gltf.bufferViews[ uvBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT
  	);

  	const normalAccessorID = gltf.meshes[ 0 ].primitives[ 0 ].attributes.NORMAL;

  	if ( gltf.accessors[ normalAccessorID ].componentType != 5126 ) {

  		return null;

  	}

  	const normalBufferViewID = gltf.accessors[ normalAccessorID ].bufferView;

  	const normals = new Float32Array(
  		bin,
  		gltf.bufferViews[ normalBufferViewID ].byteOffset,
  		gltf.bufferViews[ normalBufferViewID ].byteLength / Float32Array.BYTES_PER_ELEMENT
  	);

  	const indexAccessorID = gltf.meshes[ 0 ].primitives[ 0 ].indices;

  	console.log( indexAccessorID );

  	if ( gltf.accessors[ indexAccessorID ].componentType != 5123 ) {

  		return null;

  	}

  	const indexBufferViewID = gltf.accessors[ indexAccessorID ].bufferView;

  	const indices = new Uint16Array(
  		bin,
  		gltf.bufferViews[ indexBufferViewID ].byteOffset,
  		gltf.bufferViews[ indexBufferViewID ].byteLength / Uint16Array.BYTES_PER_ELEMENT
  	);

  	return {
  		positions,
  		uvs,
  		normals,
  		indices
  	};

  }

  _loadBinaryBuffer( url: string ) {

  	return new Promise( ( resolve, reject ) => {

  		const request = new XMLHttpRequest();
  		request.open( "GET", url, true );
  		request.responseType = "arraybuffer";
  		request.onload = () => {

  			resolve( request.response );

  		};

  		request.onerror = ( err ) => {

  			reject( err );

  		};

  		request.send();

  	} );

  }

}
