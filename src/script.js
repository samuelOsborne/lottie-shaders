import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { cobblestoneMaterial, diamondMaterial, dirtMaterial, dirtMaterialTop, sandMaterial } from './Materials.js'

export let stretched = true;

/**
 * Base
 */
const gui = new dat.GUI()

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

const textureLoader = new THREE.TextureLoader(loadingManager)
const checkerboardTexture = textureLoader.load('/textures/checkerboard-8x8.png')

checkerboardTexture.generateMipmaps = false
checkerboardTexture.minFilter = THREE.NearestFilter
checkerboardTexture.magFilter = THREE.NearestFilter
checkerboardTexture.wrapS = THREE.RepeatWrapping
checkerboardTexture.wrapT = THREE.RepeatWrapping
checkerboardTexture.repeat.set(8, 8)

/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)

const checkerboardMaterial = new THREE.MeshBasicMaterial({
    map: checkerboardTexture,
    side: THREE.DoubleSide
})


/** 
 * Meshes
 * 
*/
const diamondBlock = new THREE.Mesh(geometry, diamondMaterial)

diamondBlock.position.x = 0
scene.add(diamondBlock)

const cobblestoneBlock = new THREE.Mesh(geometry, cobblestoneMaterial)

cobblestoneBlock.position.x = 1.5
scene.add(cobblestoneBlock)

const dirtBlock = new THREE.Mesh(geometry, [
    dirtMaterial,
    dirtMaterial,
    dirtMaterialTop,
    dirtMaterial,
    dirtMaterial,
    dirtMaterial,
])

dirtBlock.position.x = 3.0
scene.add(dirtBlock)

const sandBlock = new THREE.Mesh(geometry, sandMaterial)

sandBlock.position.x = 4.5
scene.add(sandBlock)


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    checkerboardMaterial
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65
scene.add(plane)

/**
 * Sizes
 */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }
const sizes = {
    width: 300,
    height: 150
}

// Looks better with 300x150 imo
// const sizes = {
//     width: 640,
//     height: 480
// }

const resize = () => {
    if (!stretched) {
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

    } else {
        // sizes.width = 640;
        // sizes.height = 480;
        sizes.width = 300;
        sizes.height = 150;

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(1);

        canvas.style.width = "";
        canvas.style.height = "";


        effectComposer.setSize(window.innerWidth, window.innerHeight);
        effectComposer.setPixelRatio(1)
    }
}

window.addEventListener('resize', () => {
    resize();
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false
})

/**
 * If we don't set size, the canvas defaults to 300x150
 * If we set size, it overrides the 100% width/height styling 
 * So we set the size to the canvas but them remove the styling it adds to get the 100% width/height of the .webgl css class
 */
renderer.setSize(sizes.width, sizes.height)
canvas.style.width = "";
canvas.style.height = "";
renderer.setPixelRatio(1)

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
 * Dithering
 */
// const orderedDitherEffect = new OrderedDitherPass(4, 1.5);
// effectComposer.addPass(orderedDitherEffect);

/**
 * HTML UI
 */
let uiElements = document.querySelectorAll('.ui');
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        uiElements.forEach((element) => {
            element.style.display = element.style.display === 'none' ? 'flex' : 'none';
        });
    }
});

let buttons = document.querySelectorAll('.btn');
buttons.forEach((element) => {
    if (element.id === "stretched") {
        element.addEventListener('click', (e) => {
            stretched = !stretched;

            console.log(stretched);

            resize();
        });
    }
});


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    diamondBlock.rotation.y += 0.01

    // Update controls
    controls.update()

    effectComposer.render()

    // Render
    // renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()