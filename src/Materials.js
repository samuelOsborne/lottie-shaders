import * as THREE from 'three'
import { LottieLoader } from 'three/addons/loaders/LottieLoader.js';

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

const lottieLoader = new LottieLoader();
lottieLoader.setQuality(2);
const lottieTexture = lottieLoader.load('/textures/pigeon.json');

export const lottieMaterial = new THREE.MeshBasicMaterial({
    map: lottieTexture,
    side: THREE.DoubleSide,
})
