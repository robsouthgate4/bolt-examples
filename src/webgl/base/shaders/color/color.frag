#version 300 es

precision highp float;

uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 viewPosition;
uniform sampler2D diffuseMap;

out vec4 FragColor;

in vec2 vUv;
in vec3 Normal;
in vec3 FragPosition;

void main()
{

  vec3 texDiffuse = texture( diffuseMap, vUv ).rgb;

  float ambientStrength = 0.5;
  vec3  ambient         = ambientStrength * lightColor * texDiffuse;

  vec3 norm           = normalize( Normal );
  vec3 lightDirection = normalize( lightPosition - FragPosition );

  float diff    = max( dot( norm, lightDirection ), 0.0 );
  vec3  diffuse = diff * lightColor * texDiffuse;

  vec3 viewDirection    = normalize( viewPosition - FragPosition );
  vec3 reflectDirection = reflect( -lightDirection, norm );

  float specularStrength = 0.1;
  float spec             = pow( max( dot( viewDirection, reflectDirection ), 0.0 ), 32.0 );
  vec3  specular         = specularStrength * spec * lightColor;

  vec3 result = ambient * objectColor;

  FragColor = vec4( ( ambient + diffuse + specular ) * objectColor, 1.0);

}