import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { cobblestoneMaterial, diamondMaterial, dirtMaterial, dirtMaterialTop, sandMaterial } from './Materials.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { createVoxelTerrain } from './VoxelWorld.js'

export let stretched = true;

const ORBIT_CONTROLS = false;

/**
 * Base
 */
const gui = new dat.GUI()
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

const textureLoader = new THREE.TextureLoader(loadingManager)
const checkerboardTexture = textureLoader.load('/textures/dirt_top.png')

checkerboardTexture.generateMipmaps = false
checkerboardTexture.minFilter = THREE.NearestFilter
checkerboardTexture.magFilter = THREE.NearestFilter
checkerboardTexture.wrapS = THREE.RepeatWrapping
checkerboardTexture.wrapT = THREE.RepeatWrapping
checkerboardTexture.repeat.set(64, 64)

/**
 * Sizes
 */
const sizes = {
    width: 300,
    height: 150
}
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }

// Looks better with 300x150 imo
// const sizes = {
//     width: 640,
//     height: 480
// }

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * Controls
 */

let controls;
let canJump = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

if (ORBIT_CONTROLS) {
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
} else {
    controls = new PointerLockControls(camera, document.body);
    controls.addEventListener('change', () => {
        console.log('pointerlock change')
    })
    controls.addEventListener('lock', () => {
        console.log('pointerlock lock')
        menuUI.style.display = 'none'
    })
    controls.addEventListener('unlock', () => {
        console.log('pointerlock unlock')
        menuUI.style.display = 'flex'
    })
}

/**
 *  Keyboard management
*/
const keyMap = {}
const onDocumentKey = (e) => {
    console.log(e.code, e.type)
    keyMap[e.code] = e.type === 'keydown'
}
document.addEventListener('keydown', onDocumentKey, false)
document.addEventListener('keyup', onDocumentKey, false)
let raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 1);

/**
 * HTML Menu UI
 */
let menuUI = document.getElementById('ui');

let buttons = document.querySelectorAll('.btn');
buttons.forEach((element) => {
    if (element.id === "stretched-btn") {
        element.addEventListener('click', (e) => {
            stretched = !stretched;

            console.log(stretched);

            resize();
        });
    }
    if (element.id === "start-btn") {
        element.addEventListener('click', (e) => {
            console.log('clickety');

            if (!ORBIT_CONTROLS) {
                controls.lock();
            } else {
                menuUI.style.display = 'none'
            }
        });
    }
});

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)

const checkerboardMaterial = new THREE.MeshBasicMaterial({
    map: checkerboardTexture,
    side: THREE.DoubleSide
})

/** 
 * Objects
*/
const diamondBlock = new THREE.Mesh(geometry, diamondMaterial)
let objects = [];

diamondBlock.position.x = 0

const cobblestoneBlock = new THREE.Mesh(geometry, cobblestoneMaterial)

cobblestoneBlock.position.x = 1.5

const dirtBlock = new THREE.Mesh(geometry, [
    dirtMaterial,
    dirtMaterial,
    dirtMaterialTop,
    dirtMaterial,
    dirtMaterial,
    dirtMaterial,
])

dirtBlock.position.x = 3.0


const sandBlock = new THREE.Mesh(geometry, sandMaterial)

sandBlock.position.x = 4.5


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 75),
    checkerboardMaterial
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65
scene.add(plane, sandBlock, dirtBlock, diamondBlock, cobblestoneBlock)
objects.push(sandBlock, dirtBlock, diamondBlock, cobblestoneBlock, plane);

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

scene.add(camera)

createVoxelTerrain(scene);

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
renderer.setClearColor(new THREE.Color('#6EB1FF'))

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
 * Animate
 */
const clock = new THREE.Clock()
let delta = 0

const tick = () => {
    delta = clock.getDelta();

    const controlsObject = controls.getObject();

    // Random
    diamondBlock.rotation.y += 0.01

    raycaster.ray.origin.copy(controlsObject.position);
    raycaster.ray.origin.y -= 0.5;

    const intersections = raycaster.intersectObjects(objects, false);
    const onObject = intersections.length > 0;

    velocity.y -= 9.8 * 10.0 * delta; // 10.0 = mass

    // Update controls
    if (ORBIT_CONTROLS) {
        controls.update()
    } else {
        if (keyMap['KeyW'] || keyMap['ArrowUp']) {
            if (keyMap['ShiftLeft'] || keyMap['ShiftRight']) {
                controls.moveForward(delta * 15)
            } else {
                controls.moveForward(delta * 5)
            }
        }
        if (keyMap['KeyS'] || keyMap['ArrowDown']) {
            controls.moveForward(-delta * 5)
        }
        if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
            controls.moveRight(-delta * 5)
        }
        if (keyMap['KeyD'] || keyMap['ArrowRight']) {
            controls.moveRight(delta * 5)
        }
        if (keyMap['Space']) {
            if (canJump) {
                velocity.y += 20;
                canJump = false;
            }
        }

        // If we hit the ground or object, stop falling
        if (onObject === true) {
            velocity.y = Math.max(0, velocity.y);
            canJump = true;
        }

        // If we've collected enough velocity, jump
        controlsObject.position.y += (velocity.y * delta);

        // If we're below the ground, stop falling
        if (controlsObject.position.y <= 1) {
            velocity.y = 0;
            controlsObject.position.y = 1;
            canJump = true;
        }
    }


    // effectComposer.render()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()