#version 300 es

precision highp float;

// uniform vec3 objectColor;
// uniform vec3 lightColor;
// uniform vec3 lightPosition;
uniform vec3 viewPosition;
// uniform sampler2D map0;
// uniform sampler2D map1;

out vec4 FragColor;

// in vec2 vUv;
// in vec3 Normal;
in vec3 FragPosition;

void main()
{

  // vec3 texDiffuse = texture( map0, vUv ).rgb;
  // vec3 texAO      = texture( map1, vUv ).rgb;

  // texDiffuse *= texAO.r;

  // float ambientStrength = 0.6;
  // vec3  ambient         = ambientStrength * lightColor; //* texDiffuse;

  // vec3 norm           = normalize( Normal );
  // vec3 lightDirection = normalize( lightPosition - FragPosition );

  // float diff    = max( dot( norm, lightDirection ), 0.0 );
  // vec3  diffuse = diff * lightColor; //* texDiffuse;

  // vec3 viewDirection    = normalize( viewPosition - FragPosition );
  // vec3 reflectDirection = reflect( -lightDirection, norm );

  // float specularStrength = 0.1;
  // float spec             = pow( max( dot( viewDirection, reflectDirection ), 0.0 ), 32.0 );
  // vec3  specular         = specularStrength * spec * lightColor;

  // vec3 result = ambient * objectColor;

  FragColor = vec4( vec3( 0.0 ), 1.0 );

  //FragColor = vec4( texAO, 1.0 );

}