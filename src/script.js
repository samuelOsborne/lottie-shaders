import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { RenderPixelatedPass } from 'three/examples/jsm/Addons.js';
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { BokehPass } from 'three/examples/jsm/Addons.js';
import { DotScreenPass } from 'three/examples/jsm/Addons.js';
import { lottieMaterial } from './Materials'

/**
 * User options
 */
export let stretched = false;
export let dithering = false;

const ORBIT_CONTROLS = true;

/**
 * Base
 */

const scene = new THREE.Scene()

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

loadingManager.onError = () => {

}
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-aspect / 2, aspect / 2, 0.5, -0.5, 0.1, 1000)
camera.aspect = sizes.width / sizes.height
camera.updateProjectionMatrix()
camera.position.z = 11

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lottieMaterial);
scene.add(plane)

const resize = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight

    renderer.setSize(window.innerWidth, window.innerHeight);
    const newAspect = window.innerWidth / window.innerHeight;

    camera.left = -newAspect / 2;
    camera.right = newAspect / 2;
    camera.top = 0.5;
    camera.bottom = -0.5;
    camera.updateProjectionMatrix();

    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(newAspect, 1);
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', () => {
    resize();
})

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})

renderer.domElement.style.pointerEvents = 'none';
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing
 */
const renderTarget = new THREE.WebGLRenderTarget(
    sizes.width, sizes.height,
    {
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
)

const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(1)
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

/**
 * PASSES
 */
const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera)
effectComposer.addPass(renderPixelatedPass);

const glitchPass = new GlitchPass();
effectComposer.addPass(glitchPass);

const halftonePassParams = {
    shape: 1,
    radius: 8,
    rotateR: Math.PI / 12,
    rotateB: Math.PI / 12 * 2,
    rotateG: Math.PI / 12 * 3,
    scatter: 0,
    blending: 1,
    blendingMode: 4,
    greyscale: false,
    disable: false
};

const halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, halftonePassParams);
effectComposer.addPass(halftonePass);


const bloomParams = {
    threshold: 0,
    strength: 1,
    radius: 0,
    exposure: 1
}

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
effectComposer.addPass(bloomPass);
bloomPass.threshold = bloomParams.threshold;
bloomPass.strength = bloomParams.strength;
bloomPass.radius = bloomParams.radius;

const bokehPass = new BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.025,
    maxblur: 0.01,
});
effectComposer.addPass(bokehPass);

const dotScreenPass = new DotScreenPass();
effectComposer.addPass(dotScreenPass);

// -------------------

const gui = new dat.GUI()

const pixelateCheckbox = {
    pixelate: true,
    dotScreen: false,
    glitch: false,
    halfTone: false,
    bloom: false,
    bokeh: false
};


const pixelateFolder = gui.addFolder('Pixelate');
pixelateFolder.add(pixelateCheckbox, 'pixelate');
pixelateFolder.add(pixelateCheckbox, 'dotScreen');

let pixelateParams = { pixelSize: 6, normalEdgeStrength: 0, depthEdgeStrength: 0 };
pixelateFolder.add(pixelateParams, 'pixelSize').min(1).max(16).step(1)
    .onChange(() => {
        renderPixelatedPass.setPixelSize(pixelateParams.pixelSize);
    });

gui.add(pixelateCheckbox, 'glitch');
gui.add(pixelateCheckbox, 'halfTone');


const bloomFolder = gui.addFolder('Bloom');

bloomFolder.add(pixelateCheckbox, 'bloom');

bloomFolder.add(bloomParams, 'strength').min(0.1).max(5).step(0.1)
    .onChange(() => {
        bloomPass.strength = bloomParams.strength;
    });


gui.add(pixelateCheckbox, 'bokeh');

// -------------------


/**
 * Animate
 */
const clock = new THREE.Clock()
let delta = 0

const tick = () => {
    delta = clock.getDelta();


    if (!pixelateCheckbox.pixelate) {
        effectComposer.passes[1].enabled = false;
    } else {
        effectComposer.passes[1].enabled = true;
    }
    if (!pixelateCheckbox.glitch) {
        effectComposer.passes[2].enabled = false;
    } else {
        effectComposer.passes[2].enabled = true;
    }
    if (!pixelateCheckbox.halfTone) {
        effectComposer.passes[3].enabled = false;
    } else {
        effectComposer.passes[3].enabled = true;
    }
    if (!pixelateCheckbox.bloom) {
        effectComposer.passes[4].enabled = false;
    }
    else {
        effectComposer.passes[4].enabled = true;
    }
    if (!pixelateCheckbox.bokeh) {
        effectComposer.passes[5].enabled = false;
    }
    else {
        effectComposer.passes[5].enabled = true;
    }
    if (!pixelateCheckbox.dotScreen) {
        effectComposer.passes[6].enabled = false;
    }
    else {
        effectComposer.passes[6].enabled = true;
    }

    effectComposer.render()
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()