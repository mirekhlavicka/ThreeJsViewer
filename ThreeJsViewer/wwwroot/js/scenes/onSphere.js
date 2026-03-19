import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export const onSphereScene = {
    name: "Games/On sphere",
    models: [
        {
            path: 'assets/OnSphere/ball1.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            }
        },
        {
            path: 'assets/OnSphere/penguin.ply',
            color: 0xffd700,
            createMaterial: () => createTwistMaterial(0xF8E47E),
            prepareGeometry: g => {
                g.rotateZ(Math.PI);
                g.scale(0.06, 0.06, 0.06);
                //g.translate(0, 0, 1.005);
            },
            animate: (m, t) => {
                m.material.userData.uTime.value = t;

                /*
                //m.position.z = 1.01;

                m.position.x = 1.01 * Math.sin(-0.2 * t);
                m.position.z = 1.01 * Math.cos(0.2 * t);*/

                updateFigureTransform(m,
                    Math.sin(-0.08 * t), 0, Math.cos(0.08 * t), 
                    -Math.cos(0.08 * t), 0, Math.sin(-0.08 * t),
                    0.006)
            }
        }
    ]
}

/**
 * @param {THREE.Object3D} figure - Your character mesh/model
 * @param {number} x, y, z - Coordinates on the sphere surface
 * @param {number} v1, v2, v3 - Velocity components (direction of movement)
 * @param {number} shift - Distance to offset figure so it stands on surface
 */
function updateFigureTransform(figure, x, y, z, v1, v2, v3, shift) {
    // 1. Create Vectors from inputs
    const pos = new THREE.Vector3(x, y, z);
    const vel = new THREE.Vector3(v1, v2, v3);

    // 2. Define the Basis Vectors
    // Z-axis (Normal): Points from center through the position
    const newZ = pos.clone().normalize();

    // X-axis (Side): Perpendicular to both Velocity and the Normal
    // We calculate this first to ensure a perfect 90-degree system
    const newX = new THREE.Vector3().crossVectors(vel, newZ).normalize();

    // Y-axis (Forward): Perpendicular to Up and Side
    // This ensures Y aligns with velocity even if v1,v2,v3 isn't perfectly tangent
    const newY = new THREE.Vector3().crossVectors(newZ, newX).normalize();

    // 3. Create and apply the Rotation Matrix
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(newX, newY, newZ);
    figure.quaternion.setFromRotationMatrix(matrix);

    // 4. Set Position with the radial shift
    // We add the normalized 'up' vector multiplied by your shift value
    figure.position.set(
        x + (newZ.x * shift),
        y + (newZ.y * shift),
        z + (newZ.z * shift)
    );
}

function createTwistMaterial(baseColorHex) {
    // 1. Create standard material (keeps your lighting/colors)
    const material = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        flatShading: false,
        vertexColors: false,
        metalness: 0.7,
        roughness: 0.3
    });

    // 2. Define uniforms to pass data from JS to the Shader
    material.userData.uTime = { value: 0 };
    material.userData.uTwistStrength = { value: 8.0 };

    material.onBeforeCompile = (shader) => {
        // Pass our JS uniforms into the shader
        shader.uniforms.uTime = material.userData.uTime;
        shader.uniforms.uTwistStrength = material.userData.uTwistStrength;

        // 3. Inject uniform declarations into Vertex Shader
        shader.vertexShader = `
            uniform float uTime;
            uniform float uTwistStrength;
        ` + shader.vertexShader;

        // 4. Inject the deformation math
        // 'transformed' is the standard Three.js variable for vertex position
        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            
            float angle =
                (1.0 - smoothstep(-0.005, 0.025, transformed.z)) *
                transformed.x * uTwistStrength * sin(uTime * 16.0);
            
            float s = sin(angle);
            float c = cos(angle);
            
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.yz = rotationMatrix * transformed.yz;


            angle = 0.6 *
                smoothstep(0.0, 0.03, transformed.z) *
                sin(uTime * 2.0);
            s = sin(angle);
            c = cos(angle);

            rotationMatrix = mat2(c, -s, s, c);

            transformed.xy = rotationMatrix * transformed.xy;

            `
        );
    };

    return material;
}
