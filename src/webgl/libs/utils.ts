export const remapRange = ( value: number, x1: number, y1: number, x2: number, y2: number ) =>
	( ( value - x1 ) * ( y2 - x2 ) ) / ( y1 - x1 ) + x2;

export const componentToHex = ( c: number ) => {

	var hex = c.toString( 16 );
	return hex.length == 1 ? "0" + hex : hex;

};

export const rgbToHex = ( r: number, g: number, b: number ) => {

	return "#" + componentToHex( r ) + componentToHex( g ) + componentToHex( b );

};

export const calcPosFromLatLonRad = ( lat: number, lon: number, radius: number ) => {

	let phi = ( 90 - lat ) * ( Math.PI / 180 );

	let theta = ( lon + 180 ) * ( Math.PI / 180 );

	const x = - ( radius * Math.sin( phi ) * Math.cos( theta ) );
	const z = radius * Math.sin( phi ) * Math.sin( theta );
	const y = radius * Math.cos( phi );

	return { x, y, z };

};
