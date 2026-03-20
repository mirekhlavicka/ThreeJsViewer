import { smoothAnim } from '../../utils.js';
import { vertices } from './dodeca.js';
import * as THREE from 'three';

let currenti = 0;
let currentj = 1;
let changed = false;


export const penguinScene = {
    name: "Games/Quo vadis penguin",
    models: [
        {
            path: 'assets/OnSphere/ball2.ply',
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

                let x1 = vertices[currenti].x;
                let y1 = vertices[currenti].y;
                let z1 = vertices[currenti].z;

                let n = vertices[currenti].vertices[currentj];

                let x2 = vertices[n].x;
                let y2 = vertices[n].y;
                let z2 = vertices[n].z;

                let tt = 0.2 * t % 1;

                if (tt < 0.01) {
                    changed = false;
                }

                if (tt >= 0.99 && !changed) {
                    currenti = n;
                    currentj = Math.floor(Math.random() * vertices[currenti].vertices.length);
                    changed = true;
                }

                if (!changed) {
                    let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, tt);
                    updateFigureTransform(m, pos.x, pos.y, pos.z, pos.v1, pos.v2, pos.v3, 0.03);
                }

                /*updateFigureTransform(m,
                    Math.sin(-0.08 * t), 0, Math.cos(0.08 * t), 
                    -Math.cos(0.08 * t), 0, Math.sin(-0.08 * t),
                    0.03)*/
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

/**
 * Calculates position and eased velocity along a great circle path.
 * @param {number} x1, y1, z1 - Start point (t=0)
 * @param {number} x2, y2, z2 - End point (t=1)
 * @param {number} t - Linear time (0 to 1)
 * @returns {Object} {x, y, z, v1, v2, v3}
 */
function getGeodesicState(x1, y1, z1, x2, y2, z2, t) {
    // 1. Setup Vectors
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);

    // 2. Define the rotation axis (perpendicular to the path)
    const axis = new THREE.Vector3().crossVectors(p1, p2);

    // Handle cases where points are identical or polar opposites
    if (axis.lengthSq() < 0.000001) {
        return { x: x1, y: y1, z: z1, v1: 0, v2: 0, v3: 0 };
    }
    axis.normalize();

    // 3. Calculate Easing using Three.js built-in utility
    // This transforms linear t into a curved t
    const easedT = THREE.MathUtils.smoothstep(t, 0, 1);

    // 4. Calculate Position at eased time
    const totalAngle = p1.angleTo(p2);
    const currentAngle = easedT * totalAngle;
    const posAtT = p1.clone().applyAxisAngle(axis, currentAngle);

    // 5. Calculate Velocity (Direction * Speed)
    // The derivative of smoothstep (3t^2 - 2t^3) is (6t - 6t^2)
    const speed = (6 * t - 6 * t * t) * totalAngle;

    // Get the normalized direction vector (tangent to sphere)
    const direction = new THREE.Vector3().crossVectors(axis, posAtT).normalize();

    // If we are at the very start/end, speed is 0. 
    // We return the direction vector so the character still "points" the right way.
    const velocity = direction.clone().multiplyScalar(Math.max(speed, 0.0001));

    return {
        x: posAtT.x,
        y: posAtT.y,
        z: posAtT.z,
        v1: velocity.x,
        v2: velocity.y,
        v3: velocity.z
    };
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
