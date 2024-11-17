import * as THREE from 'three'
import { cobblestoneMaterial, diamondMaterial, dirtMaterial, dirtMaterialTop, sandMaterial } from './Materials.js'

class VoxelWorld {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.data = new Uint8Array(width * height * depth);

        // Face definitions with UV coordinates added
        this.faces = {
            front: {
                vertices: [
                    0, 0, 1,    // bottom left
                    1, 0, 1,    // bottom right
                    1, 1, 1,    // top right
                    0, 1, 1,    // top left
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [0, 0, 1],
                dir: [0, 0, 1]
            },
            back: {
                vertices: [
                    1, 0, 0,    // bottom right
                    0, 0, 0,    // bottom left
                    0, 1, 0,    // top left
                    1, 1, 0,    // top right
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [0, 0, -1],
                dir: [0, 0, -1]
            },
            top: {
                vertices: [
                    0, 1, 0,    // back left
                    1, 1, 0,    // back right
                    1, 1, 1,    // front right
                    0, 1, 1,    // front left
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [0, 1, 0],
                dir: [0, 1, 0]
            },
            bottom: {
                vertices: [
                    0, 0, 0,    // back left
                    1, 0, 0,    // back right
                    1, 0, 1,    // front right
                    0, 0, 1,    // front left
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [0, -1, 0],
                dir: [0, -1, 0]
            },
            left: {
                vertices: [
                    0, 0, 0,    // back bottom
                    0, 0, 1,    // front bottom
                    0, 1, 1,    // front top
                    0, 1, 0,    // back top
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [-1, 0, 0],
                dir: [-1, 0, 0]
            },
            right: {
                vertices: [
                    1, 0, 1,    // front bottom
                    1, 0, 0,    // back bottom
                    1, 1, 0,    // back top
                    1, 1, 1,    // front top
                ],
                uvs: [
                    0, 1,  // bottom left
                    1, 1,  // bottom right
                    1, 0,  // top right
                    0, 0,  // top left
                ],
                normal: [1, 0, 0],
                dir: [1, 0, 0]
            }
        };
    }

    getVoxel(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return 0;
        }
        return this.data[x + y * this.width + z * this.width * this.height];
    }

    setVoxel(x, y, z, type) {
        this.data[x + y * this.width + z * this.width * this.height] = type;
    }

    generateGeometry() {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        let vertexCount = 0;

        // For each voxel position
        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.depth; z++) {
                for (let x = 0; x < this.width; x++) {
                    const voxel = this.getVoxel(x, y, z);

                    if (voxel) {
                        // Check each face
                        for (const [faceName, face] of Object.entries(this.faces)) {
                            // Check if there's a block in the direction of this face
                            const nx = x + face.dir[0];
                            const ny = y + face.dir[1];
                            const nz = z + face.dir[2];

                            const neighbor = this.getVoxel(nx, ny, nz);

                            // Only create the face if there's no neighbor blocking it
                            if (!neighbor) {
                                // Add vertices
                                for (let i = 0; i < 12; i += 3) {
                                    positions.push(
                                        face.vertices[i] + x,
                                        face.vertices[i + 1] + y,
                                        face.vertices[i + 2] + z
                                    );
                                    normals.push(...face.normal);
                                }

                                // Add UVs
                                for (let i = 0; i < 8; i += 2) {
                                    uvs.push(face.uvs[i], face.uvs[i + 1]);
                                }

                                // Add indices
                                indices.push(
                                    vertexCount, vertexCount + 1, vertexCount + 2,
                                    vertexCount, vertexCount + 2, vertexCount + 3
                                );
                                vertexCount += 4;
                            }
                        }
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);

        return geometry;
    }

    createMesh(material) {
        const geometry = this.generateGeometry();
        return new THREE.Mesh(geometry, material);
    }
}

// Create test world
export function createVoxelTerrain(scene) {
    const world = new VoxelWorld(3, 3, 3);

    // Create a test pattern
    world.setVoxel(0, 0, 0, 1); // Corner block
    world.setVoxel(1, 0, 0, 1); // Adjacent block
    world.setVoxel(0, 1, 0, 1); // Stacked block
    world.setVoxel(1, 1, 1, 1); // Diagonal block

    const mesh = world.createMesh(diamondMaterial
    );
    scene.add(mesh);
}