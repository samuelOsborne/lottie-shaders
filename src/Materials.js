import * as THREE from 'three'

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager()

loadingManager.onStart = () => {

}

loadingManager.onLoad = () => {
    console.log('Texture loaded!')
}

loadingManager.onProgress = (e) => {
    console.log('Texture progress', e)
}

loadingManager.onError = (e) => {
    console.error('Texture error', e)
}

const textureLoader = new THREE.TextureLoader(loadingManager)
const diamondTexture = textureLoader.load('/textures/minecraft.png')
const sandTexture = textureLoader.load('/textures/sand.png')
const cobblestoneTexture = textureLoader.load('/textures/cobblestone.png')
const dirtTextureSide = textureLoader.load('/textures/dirt.png')
const dirtTextureTop = textureLoader.load('/textures/dirt_top.png')


diamondTexture.generateMipmaps = false
diamondTexture.minFilter = THREE.NearestFilter
diamondTexture.magFilter = THREE.NearestFilter

sandTexture.generateMipmaps = false
sandTexture.minFilter = THREE.NearestFilter
sandTexture.magFilter = THREE.NearestFilter

cobblestoneTexture.generateMipmaps = false
cobblestoneTexture.minFilter = THREE.NearestFilter
cobblestoneTexture.magFilter = THREE.NearestFilter

dirtTextureSide.generateMipmaps = false
dirtTextureSide.minFilter = THREE.NearestFilter
dirtTextureSide.magFilter = THREE.NearestFilter

dirtTextureTop.generateMipmaps = false
dirtTextureTop.minFilter = THREE.NearestFilter
dirtTextureTop.magFilter = THREE.NearestFilter

export const jitterVertexShader = `
// Needed if shadowmap is enabled
vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);

vUvTransformed = uv;

vec4 v = modelViewMatrix * vec4(position, 1.0);

gl_Position = projectionMatrix * v;

gl_Position /=  gl_Position.w;

gl_Position.xy = floor(gl_Position.xy * uJitterLevel) / uJitterLevel * gl_Position.w;
`
export const jitterFragmentShader = `
vec4 texelColor = texture2D(map, vUvTransformed);
diffuseColor *= texelColor;
gl_FragColor = vec4(diffuseColor);
`

export const diamondMaterial = new THREE.MeshBasicMaterial({
    map: diamondTexture,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
        shader.uniforms.uJitterLevel = { value: 100 };

        shader.vertexShader = `
      uniform float uJitterLevel;
      varying vec2 vUvTransformed;
      
      ${shader.vertexShader}
    `.replace(
            `#include <worldpos_vertex>`,
            jitterVertexShader
        );

        //     shader.fragmentShader = `
        //     varying vec2 vUvTransformed;

        //     ${shader.fragmentShader}
        //   `.replace(
        //         `#include <map_fragment>`,
        //         `
        //       vec4 texelColor = texture2D(map, vUvTransformed);
        //       diffuseColor *= texelColor;
        //       gl_FragColor = vec4(diffuseColor);
        //     `
        //     );
    },
})

export const sandMaterial = new THREE.MeshBasicMaterial({
    map: sandTexture,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
        shader.uniforms.uJitterLevel = { value: 100 };

        shader.vertexShader = `
      uniform float uJitterLevel;
      varying vec2 vUvTransformed;
      
      ${shader.vertexShader}
    `.replace(
            `#include <worldpos_vertex>`,
            jitterVertexShader
        );
    },
})

export const cobblestoneMaterial = new THREE.MeshBasicMaterial({
    map: cobblestoneTexture,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
        shader.uniforms.uJitterLevel = { value: 100 };

        shader.vertexShader = `
      uniform float uJitterLevel;
      varying vec2 vUvTransformed;
      
      ${shader.vertexShader}
    `.replace(
            `#include <worldpos_vertex>`,
            jitterVertexShader
        );
    },
})

export const dirtMaterial = new THREE.MeshBasicMaterial({
    map: dirtTextureSide,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
        shader.uniforms.uJitterLevel = { value: 100 };

        shader.vertexShader = `
      uniform float uJitterLevel;
      varying vec2 vUvTransformed;
      
      ${shader.vertexShader}
    `.replace(
            `#include <worldpos_vertex>`,
            jitterVertexShader
        );
    },
})

export const dirtMaterialTop = new THREE.MeshBasicMaterial({
    map: dirtTextureTop,
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
        shader.uniforms.uJitterLevel = { value: 100 };

        shader.vertexShader = `
      uniform float uJitterLevel;
      varying vec2 vUvTransformed;
      
      ${shader.vertexShader}
    `.replace(
            `#include <worldpos_vertex>`,
            jitterVertexShader);
    },
})