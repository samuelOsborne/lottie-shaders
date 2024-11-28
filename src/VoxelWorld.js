import * as THREE from 'three';
import { cobblestoneMaterial, dirtMaterial, lottieMaterial } from "./Materials";

export class VoxelWorld {
    constructor(chunksize) {
        this.chunksize = chunksize
        this.cell = new Uint8Array(chunksize * chunksize * chunksize);
    }



    generateGeometryDataForChunk() {
        // for ()
    }
}

VoxelWorld.CubeFaces = {
    Front: [
        // Front - Right Slice Triangle
        { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] },
        { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0] },
        { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] },

        // Front - Left Slice Triangle
        { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1] },
        { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] },
        { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] },
    ],
    Back: [
        // Back - Right Slice Triangle
        { pos: [1, 1, -1], norm: [0, 0, -1], uv: [1, 1] },
        { pos: [1, -1, -1], norm: [0, 0, -1], uv: [1, 0] },
        { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [0, 0] },

        // Back - Left Slice Triangle
        { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [0, 1] },
        { pos: [1, 1, -1], norm: [0, 0, -1], uv: [1, 1] },
        { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [0, 0] },
    ],
    Left: [
        // Left - Right Slice Triangle
        { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] },
        { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0] },
        { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] },

        // Left - Left Slice Triangle
        { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1] },
        { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] },
        { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] },
    ],
    Right: [

        // Right - Right Slice Triangle
        { pos: [1, 1, 1], norm: [1, 0, 0], uv: [1, 1] },
        { pos: [1, -1, 1], norm: [1, 0, 0], uv: [1, 0] },
        { pos: [1, -1, -1], norm: [1, 0, 0], uv: [0, 0] },

        // Right - Left Slice Triangle
        { pos: [1, 1, -1], norm: [1, 0, 0], uv: [0, 1] },
        { pos: [1, 1, 1], norm: [1, 0, 0], uv: [1, 1] },
        { pos: [1, -1, -1], norm: [1, 0, 0], uv: [0, 0] }
    ],
    Top: [
        // Top - Left Slice Triangle
        { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [0, 1] },
        { pos: [1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
        { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },

        // Top - Right Slice Triangle
        { pos: [1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
        { pos: [1, 1, 1], norm: [0, 1, 0], uv: [1, 0] },
        { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },
    ],
    Bottom: [
        // Bottom - Left Slice Triangle
        { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [0, 1] },
        { pos: [1, -1, -1], norm: [0, -1, 0], uv: [1, 1] },
        { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [0, 0] },

        // Bottom - Right Slice Triangle
        { pos: [1, -1, -1], norm: [0, -1, 0], uv: [1, 1] },
        { pos: [1, -1, 1], norm: [0, -1, 0], uv: [1, 0] },
        { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [0, 0] },
    ],
}

export function generateVoxelWorld(scene) {
    const vWorld = new VoxelWorld(32);

    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;

    const positions = [];
    const normals = [];
    const uvs = [];
    for (const [_, faceVertices] of Object.entries(VoxelWorld.CubeFaces)) {
        for (const { pos, norm, uv } of faceVertices) {
            positions.push(...pos);
            normals.push(...norm);
            uvs.push(...uv);
        }
    }
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
    geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
    geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

    // geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, lottieMaterial);

    scene.add(mesh);
}