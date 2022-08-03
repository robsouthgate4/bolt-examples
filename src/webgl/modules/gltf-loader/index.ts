import Bolt, { Batch, CLAMP_TO_EDGE, FLOAT, LINEAR, Mesh, Node, Shader, Texture, Transform } from "@bolt-webgl/core";
import { GeometryBuffers } from "@bolt-webgl/core/build/Mesh";
import { mat4, quat, vec3, vec4 } from "gl-matrix";
import { Accessor, GlTf, Material, Mesh as GLTFMesh, MeshPrimitive, Node as GLTFNode, Texture as GLTFTexture, Skin as GLTFSkin, BufferView } from "./types/GLTF";
import { TypedArray } from "./types/TypedArray";

import vertexShader from "./shaders/color/color.vert";
import fragmentShader from "./shaders/color/color.frag";
import skinVertexShader from "./shaders/skin/skin.vert";
import skinFragmentShader from "./shaders/skin/skin.frag";

import Skin from "./Skin";
import SkinMesh from "./SkinMesh";

enum BufferType {
	Float = 5126,
	Short = 5123,
}

interface Buffer {
	data: Float32Array | Int16Array;
	size: number;
	type: string;
	componentType: BufferType;
	glBuffer: WebGLBuffer;
}

export default class GLTFLoader {

	private _bolt: Bolt;

	private _accessorSize: { [key: string]: number } = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16,
	};

	private _typedArrayMap: { [key: string]: TypedArray } = {
		'5120': Int8Array,
		'5121': Uint8Array,
		'5122': Int16Array,
		'5123': Uint16Array,
		'5124': Int32Array,
		'5125': Uint32Array,
		'5126': Float32Array,
	}

	private _path!: string;
	private _materials!: Shader[];
	private _textures!: Texture[];
	private _root!: Node;
	private _skins!: Skin[];
	private _nodes!: { id: number; node: Node; mesh: number | undefined; skin: number | undefined; localBindTransform: Transform; animatedTransform: mat4; children: number[]; }[];
	private _batches!: ( Batch | undefined )[][]
	private _skinNodes!: { nodeIndex: number; skinIndex: number; meshIndex?: number; }[];
	private _useSkinShader = false;

	constructor( bolt: Bolt ) {

		this._bolt = bolt;

	}

	async load( url: string ) {

		const file = url.split( '\\' ).pop()!.split( '/' ).pop() || "";
		const path = url.split( '/' ).slice( 0, - 1 ).join( '/' ) + '/';

		this._path = path;

		let json: GlTf;

		if ( ! file.match( /\.glb/ ) ) {

			json = await fetch( url ).then( ( res ) => res.json() );

		} else {

			json = await fetch( url )
				.then( ( res ) => res.arrayBuffer() )
				.then( ( glb ) => this._decodeGLB( glb ) );

		}

		if ( json.accessors === undefined || json.accessors.length === 0 ) {

			throw new Error( 'GLTF File is missing accessors' );

		}

		// grab buffers
		const buffers = await Promise.all(
			json.buffers!.map( async ( buffer ) => await this._fetchBuffer( url, buffer as BufferView ) )
		);

		this._skinNodes = [];

		// arrange nodes with correct transforms
		this._nodes = json.nodes!.map( ( node, index ) => this._parseNode( index, node ) );

		// map textures
		if ( json.textures ) {

			this._textures = await Promise.all(
				json.textures!.map( async ( texture ) => await this._parseTexture( json, texture ) )
			);

		}

		// map skins
		if ( json.skins ) {

			this._skins = json.skins!.map( ( skin: GLTFSkin ) => this._parseSkin( json, skin, buffers ) );

			if ( this._skins.length > 0 ) {

				this._useSkinShader = true;

			}

		}

		// map materials
		if ( json.materials ) {

			this._materials = json.materials!.map( ( material: Material ) => this._parseMaterials( json, material ) );

		}

		// map batches
		this._batches = json.meshes!.map( ( mesh ) => this._parseBatch( json, mesh, buffers ) );


		// arrange scene graph
		this._nodes!.forEach( ( node: GLTFNode, i: number ) => {

			const children = node.children;

			if ( node.skin !== undefined ) {

				if ( node.mesh != undefined ) {

					this._skinNodes.push( { nodeIndex: i, skinIndex: node.skin, meshIndex: node.mesh } );

				} else {

					this._skinNodes.push( { nodeIndex: i, skinIndex: node.skin } );

				}

			} else {

				if ( node.mesh !== undefined ) {

					const b = this._batches[ node.mesh ];

					b.forEach( ( batch?: Batch ) => {

						batch?.setParent( this._nodes[ i ].node );

					} );

				}

			}

			// set parent nodes
			if ( children ) {

				children.forEach( ( childIndex: number ) => {

					const n = this._nodes[ childIndex ];

					n.node.setParent( this._nodes[ i ].node );

				} );

			}


		} );

		this._skinNodes!.forEach( ( skinNode: { nodeIndex: number; skinIndex: number; meshIndex?: number; } ) => {

			const skin = this._skins[ skinNode.skinIndex ];

			const mesh = skinNode.meshIndex;
			const nodeIndex = skinNode.nodeIndex;

			if ( mesh !== undefined ) {

				const b = this._batches[ mesh ];

				if ( b !== undefined ) {

					b.forEach( ( batch?: Batch ) => {

						const realMesh = batch!.mesh as SkinMesh;

						realMesh.skin = skin;

						batch?.setParent( this._nodes[ nodeIndex ].node );

					} );

				}


			}

		} );

		this._root = new Node();

		json.scenes!.forEach( ( scene ) => {

			this._root.name = scene.name;

			scene.nodes?.forEach( childNode => {

				const child = this._nodes[ childNode ];

				child.node.setParent( this._root );

			} );

		} );

		return this._root;


	}

	_parseSkin( gltf: GlTf, skin: GLTFSkin, buffers: ArrayBufferLike[] ): Skin {

		const bindTransforms = this._getBufferFromFile( gltf, buffers, gltf.accessors![ skin.inverseBindMatrices! ] );
		const joints = skin.joints.map( ndx => this._nodes[ ndx ].node );
		return new Skin( joints, bindTransforms.data as Float32Array );

	}

	_parseNode( index: number, node: GLTFNode ) {

		const { name, translation, rotation, scale, mesh, children, skin } = node;

		const trs = new Transform();
		trs.position = translation ? vec3.fromValues( translation[ 0 ], translation[ 1 ], translation[ 2 ] ) : vec3.fromValues( 0, 0, 0 );
		trs.quaternion = rotation ? quat.fromValues( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], rotation[ 3 ] ) : quat.fromValues( 0, 0, 0, 1 );
		trs.scale = scale ? vec3.fromValues( scale[ 0 ], scale[ 1 ], scale[ 2 ] ) : vec3.fromValues( 1, 1, 1 );

		const n = new Node();
		n.name = name;
		n!.transform = trs;

		return {
			id: index,
			node: n,
			mesh,
			skin,
			localBindTransform: trs,
			animatedTransform: mat4.create(),
			children: children || []
		};

	}

	_parseBatch( gltf: GlTf, mesh: GLTFMesh, buffers: ArrayBufferLike[] ) {

		return mesh.primitives.map( ( primitive ) => {

			if ( primitive.indices !== undefined ) {

				// get index accessor
				const indexAccesor = gltf.accessors![ primitive.indices! ];

				const uvs = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "TEXCOORD_0" ) || undefined;
				const uvs2 = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "TEXCOORD_1" ) || undefined;
				const normals = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "NORMAL" ) || undefined;
				const indices = this._getBufferFromFile( gltf, buffers, indexAccesor ) || undefined;

				// form bolt default geo buffers
				const geometry: GeometryBuffers = {
					// every geometry should have position data by default
					positions: this._getBufferByAttribute( gltf, buffers, mesh, primitive, "POSITION" )!.data as Float32Array,
					normals: normals ? normals!.data as Float32Array : undefined,
					uvs: uvs ? uvs!.data as Float32Array : undefined,
					indices: indices ? indices!.data as Int16Array : undefined
				};

				// get joints from buffer
				const joints = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "JOINTS_0" ) || undefined;

				// get weights from buffer
				const weights = this._getBufferByAttribute( gltf, buffers, mesh, primitive, "WEIGHTS_0" ) || undefined;

				let m: Mesh | SkinMesh;
				let s: Shader;

				s = this._materials ? this._materials[ primitive.material as number ] : new Shader( vertexShader, fragmentShader );

				if ( joints !== undefined ) {

					// form skinned mesh data if joints defined
					m = new SkinMesh( geometry );
					m.addAttribute( Float32Array.from( joints!.data ), joints!.size, { shader: s, attributeName: "aJoints" } );
					m.addAttribute( weights!.data, weights!.size, { shader: s, attributeName: "aWeights" }, FLOAT );

				} else {

					m = new Mesh( geometry );

				}

				const batch = new Batch( m, s );
				batch.name = mesh.name;

				return batch;

			}

		} );

	}

	_parseMaterials( gltf: GlTf, material: Material ): Shader {

		//TODO:Full PBR shader setup

		const shader = this._useSkinShader ? new Shader( skinVertexShader, skinFragmentShader ) : new Shader( vertexShader, fragmentShader );

		shader.name = material.name;

		if ( material.extensions !== undefined ) {

			if ( material.extensions.KHR_materials_pbrSpecularGlossiness !== undefined ) {

				console.warn( "pbr specular glossiness not supported by Bolt" );

				const { diffuseTexture } = material.extensions.KHR_materials_pbrSpecularGlossiness;

				if ( diffuseTexture !== undefined && this._textures[ diffuseTexture.index ] ) {

					shader.activate();
					shader.setTexture( "baseTexture", this._textures[ diffuseTexture.index ] );

				}

			}

		}

		if ( material.pbrMetallicRoughness !== undefined ) {

			const { baseColorTexture, baseColorFactor } = material.pbrMetallicRoughness;
			shader.activate();

			if ( baseColorTexture ) {

				shader.setTexture( "baseTexture", this._textures[ baseColorTexture.index ] );

			}

			if ( baseColorFactor != undefined ) {

				shader.setVector4(
					"baseColorFactor",
					vec4.fromValues(
						baseColorFactor[ 0 ],
						baseColorFactor[ 1 ],
						baseColorFactor[ 2 ],
						baseColorFactor[ 3 ] )
				);

			}

		}

		return shader;

	}

	async _parseTexture( gltf: GlTf, texture: GLTFTexture ) {

		const t = gltf.images![ texture.source! ];
		const s = gltf.samplers![ texture.sampler! ];

		let boltTexture = new Texture();

		if ( t.bufferView ) {

			const bufferView = gltf.bufferViews![ t.bufferView! ];

			const data = gltf.buffers![ bufferView.buffer ].binary;

			const blob = new Blob( [ new Uint8Array( data, bufferView.byteOffset, bufferView.byteLength ) ] );

			const image = new Image();

			image.src = URL.createObjectURL( blob );

			await image.decode();

			boltTexture = new Texture( {
				imagePath: image.src,
				wrapS: s.wrapS || CLAMP_TO_EDGE,
				wrapT: s.wrapT || CLAMP_TO_EDGE,
			} );

			await boltTexture.load();

		}

		if ( t.uri ) {

			boltTexture = new Texture( {
				imagePath: this._path + t.uri,
				wrapS: s.wrapS || CLAMP_TO_EDGE,
				wrapT: s.wrapT || CLAMP_TO_EDGE,
			} );

			boltTexture.minFilter = s.minFilter! || LINEAR;
			boltTexture.magFilter = s.magFilter! || LINEAR;

			await boltTexture.load();

		}

		return boltTexture;


	}

	/**
	 * @param  {string} path
	 * @param  {BufferView} buffer
	 * Returns buffers from either a .bin file or the binary property from .glb
	 */
	async _fetchBuffer( path: string, buffer: BufferView ) {

		if ( buffer.binary ) return buffer.binary;

		const dir = path.split( '/' ).slice( 0, - 1 ).join( '/' );
		const response = await fetch( `${dir}/${buffer.uri}` );
		return await response.arrayBuffer();

	}

	_getBufferFromFile( gltf: GlTf, buffers: ArrayBuffer[], accessor: Accessor ) {

		const bufferView = gltf.bufferViews![ <number>accessor.bufferView ];

		const type = accessor.type;

		// size of the data set
		const size = this._accessorSize[ type ];

		// component type as number
		const componentType = accessor.componentType;

		// get the array buffer type from map and fetch relevant data
		const data = new this._typedArrayMap[ componentType ]( buffers[ bufferView.buffer ], ( accessor.byteOffset || 0 ) + ( bufferView.byteOffset || 0 ), accessor.count * size ) as ArrayBuffer;

		return {
			size,
			data,
			componentType,
			type
		} as Buffer;

	}

	_getBufferByAttribute( gltf: GlTf, buffers: ArrayBuffer[], mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) {

		if ( primitive.attributes[ attributeName ] === undefined ) return;
		const accessor = this._getAccessor( gltf, mesh, primitive, attributeName );
		const bufferData = this._getBufferFromFile( gltf, buffers, accessor );
		return bufferData;

	}

	_getAccessor = ( gltf: GlTf, mesh: GLTFMesh, primitive: MeshPrimitive, attributeName: string ) => {

		const attribute = primitive.attributes[ attributeName ];
		return gltf.accessors![ attribute ];

	};

	_decodeGLB( glb: ArrayBufferLike ) {

		// Decode and verify GLB header.
		const header = new Uint32Array( glb, 0, 3 );
		if ( header[ 0 ] !== 0x46546c67 ) {

			throw new Error( 'Invalid glTF asset.' );

		} else if ( header[ 1 ] !== 2 ) {

			throw new Error( `Unsupported glTF binary version, "${header[ 1 ]}".` );

		}

		// Decode and verify chunk headers.
		const jsonChunkHeader = new Uint32Array( glb, 12, 2 );
		const jsonByteOffset = 20;
		const jsonByteLength = jsonChunkHeader[ 0 ];
		if ( jsonChunkHeader[ 1 ] !== 0x4e4f534a ) {

			throw new Error( 'Unexpected GLB layout.' );

		}

		// Decode JSON.
		const jsonText = new TextDecoder().decode( glb.slice( jsonByteOffset, jsonByteOffset + jsonByteLength ) );
		const json = JSON.parse( jsonText );
		// JSON only
		if ( jsonByteOffset + jsonByteLength === glb.byteLength ) return json;

		const binaryChunkHeader = new Uint32Array( glb, jsonByteOffset + jsonByteLength, 2 );
		if ( binaryChunkHeader[ 1 ] !== 0x004e4942 ) {

			throw new Error( 'Unexpected GLB layout.' );

		}

		// Decode content.
		const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
		const binaryByteLength = binaryChunkHeader[ 0 ];
		const binary = glb.slice( binaryByteOffset, binaryByteOffset + binaryByteLength );
		// Attach binary to buffer
		json.buffers[ 0 ].binary = binary;
		return json;

	}

	public get root(): Node {

		return this._root;

	}
	public set root( value: Node ) {

		this._root = value;

	}



}
