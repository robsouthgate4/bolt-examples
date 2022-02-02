#version 300 es

precision highp float;

uniform vec3 objectColor;
uniform vec3 lightColor;
uniform float time;
uniform sampler2D map0;
uniform vec3 viewPosition;

out vec4 FragColor;

in vec3 Normal;
in vec3 FragPosition;
in vec3 HitPos;
in vec3 Ro;

#define MAX_STEPS 200
#define MAX_DIST 20.
#define SURFACE_DIST 1e-3

#define BOX_POS vec3( 0., 0., 0. )
#define BUMP_FACTOR .01
#define TEX_SCALE_FACTOR 6.0
#define PI 3.14159265359
#define TWO_PI ( 2.0 * PI )

mat4 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, 0, s, 0),
        vec4(0, 1, 0, 0),
        vec4(-s, 0, c, 0),
        vec4(0, 0, 0, 1)
    );
}

vec4 tex3D( in vec3 pos, in vec3 normal, sampler2D sampler )
{
	return 	texture( sampler, pos.yz )*abs(normal.x)+
			texture( sampler, pos.xz )*abs(normal.y)+
			texture( sampler, pos.xy )*abs(normal.z);
}

float sdRoundBox( vec3 p, vec3 b, float r )
{

  //p = ( rotateY( time ) * vec4(p, 1.0)).xyz;

  vec3 q = abs( p ) - b;

  vec3 normal;
  float bump = 0.0;

  //if(length(p-BOX_POS) < length(b))
	//{
	  normal = normalize(p-BOX_POS);
 		//bump = tex3D( p + (time * 0.03) * TEX_SCALE_FACTOR, normal, noise).r*BUMP_FACTOR;
	//}


  return (length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r) + bump;
}

float sdBox( vec3 p, vec3 b )
{

  vec3 normal;
	float bump = 0.0;

  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;

  float k = clamp(0.5*(q.z-q.y+s),0.0,s);
  return length(vec3(q.x,q.y-s+k,q.z-k));
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothDifference( float d1, float d2 ) {
    return max( d1, -d2 );
}

float bounceOut(float t) {
  const float a = 4.0 / 11.0;
  const float b = 8.0 / 11.0;
  const float c = 9.0 / 10.0;

  const float ca = 4356.0 / 361.0;
  const float cb = 35442.0 / 1805.0;
  const float cc = 16061.0 / 1805.0;

  float t2 = t * t;

  return t < a
    ? 7.5625 * t2
    : t < b
      ? 9.075 * t2 - 9.9 * t + 3.4
      : t < c
        ? ca * t2 - cb * t + cc
        : 10.8 * t * t - 20.52 * t + 10.72;
}

float bounceInOut(float t) {
  return t < 0.5
    ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
    : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}

float circularInOut(float t) {
  return t < 0.5
    ? 0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t))
    : 0.5 * (sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);
}

#ifndef HALF_PI
#define HALF_PI 1.5707963267948966
#endif

float elasticInOut(float t) {
  return t < 0.5
    ? 0.5 * sin(+13.0 * HALF_PI * 2.0 * t) * pow(2.0, 10.0 * (2.0 * t - 1.0))
    : 0.5 * sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) * pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
}


float GetDist( vec3 p )
{

  p = ( rotateY( time * 0.2 ) * vec4( p, 1.0 ) ).xyz;

  float displacement = sin( 60. * p.x + (time * 1.) ) * sin( 60. * p.y + (time * 1.) ) * sin( 60. * p.z + (time * 1.) ) * 0.01;

  //p += displacement;

  float d1 = mix( sdOctahedron( p, 0.3 ), sdRoundBox( p, vec3( 0.1 ), 0.1 ), elasticInOut( sin( time * 1.0 ) * 0.5 + 0.5 ) );
  float d2 = mix( d1, length( p ) - 0.3, elasticInOut( sin( (time - 1.0) * 1.0 ) * 0.5 + 0.5 ) );
  float d3 = length( p + vec3( sin( time * 3.) * 0.2, cos( time * 3.) * 0.1, 0.0 ) ) - 0.1;
  float d4 = length( p + vec3( cos( time * 0.9) * 0.2, sin( time * 1.2) * 0.1, 0.0 ) ) - 0.1;

  float f = 0.2;

  float a = opSmoothDifference( d1, d2  );
  float b = opSmoothUnion( a, d3, f );
  float c = opSmoothUnion( b, d4, f );

  return d2;
}

float fresnel(vec3 n, vec3 rd) {
  return pow(clamp(1. - dot(n, -rd), 0., 1.), 3.);
}




float RayMarch( vec3 ro, vec3 rd )
{

  float dO = 0.;
  float dS = 0.;

  for ( int i = 0; i < MAX_STEPS; i++ )
  {

    vec3 p = ro + dO * rd;

    dS = GetDist( p );
    dO += dS;

    if( dS < SURFACE_DIST || dS > MAX_DIST )
    {
      break;
    }

  }


  return dO;

}

vec3 GetNormal( vec3 p )
{
  vec2 e = vec2( 1e-2, 0.0 );
  vec3 n = GetDist( p ) - vec3(
    GetDist( p - e.xyy ),
    GetDist( p - e.yxy ),
    GetDist( p - e.yyx )
  );
  return normalize( n );
}

vec2 envMapEquirect( vec3 wcNormal, float flipEnvMap ) {

  float phi = acos( -wcNormal.y );
  float theta = atan( flipEnvMap * wcNormal.x, wcNormal.z ) + PI;
  return vec2(theta / TWO_PI, phi / PI);

}


void main()
{

  vec3 ro = Ro;
  vec3 rd = normalize( HitPos - ro );

  float d = RayMarch( ro, rd );

  vec3 col = vec3( 211., 211., 211. ) / 255.;

  if ( d < MAX_DIST )
  {
    vec3 p = ro + rd * d;

    vec3 n = GetNormal( p );

    vec3  lightPosition  = vec3(3., -5., 0.);

    vec3  lightDirection = normalize( lightPosition - p );

    float dif            = clamp( dot( n, lightDirection ), 0., 1.);

    vec3 reflectViewDirection = refract( -rd, normalize( n ), 1.0 / 1.2 );

    vec3 viewDirection    = normalize( viewPosition - FragPosition );

    vec3 reflectLightDirection = reflect( -lightDirection, n );

    vec2 uv = envMapEquirect( reflectViewDirection, 1.0 );

    vec3 reflectionTex = texture( map0, uv ).rgb;

    float specularStrength = 0.1;
    float spec             = pow( max( dot( viewDirection, reflectLightDirection ), 0.0 ), 24.0 );
    vec3  specular         = specularStrength * spec * vec3( 1.0 );

    float fresn = fresnel( n, rd );

    col = mix( reflectionTex * 1., vec3( 0.6 ), dif );

    col += fresn * 0.04;
  }

  FragColor = vec4( col, 1.0 );

}