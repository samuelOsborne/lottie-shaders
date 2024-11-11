precision mediump float;

uniform float uJitterLevel;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() 
{ 
    vUv = uv;

    vec4 v = modelViewMatrix * vec4(position, 1.0 );

    gl_Position = projectionMatrix * v;

    gl_Position /=  gl_Position.w;

    gl_Position.xy = floor(gl_Position.xy * uJitterLevel) / uJitterLevel * gl_Position.w;
}