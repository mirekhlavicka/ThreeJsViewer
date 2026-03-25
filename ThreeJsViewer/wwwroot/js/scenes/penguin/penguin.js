import { smoothAnim } from '../../utils.js';
import { dodecaVertices } from './dodeca.js';
import * as THREE from 'three';

let vertices;

export function createPenguinScene(count) {

    vertices = dodecaVertices;

    let scene = {
        setup: (camera, dirLight) => {
            camera.position.set(-1.5, 0.0, 1.0);
            //dirLight.position.set(-2, 1, 0.5);
        },
        gameMode: true,
        shadowMapType: THREE.VSMShadowMap, //THREE.VSMShadowMap, THREE.PCFShadowMap
        name: "Penguin/Quo vadis penguin",
        models: [
            {
                path: 'assets/OnSphere/ball2.ply',
                /*setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                },*/
                prepareMesh: m => {
                    m.receiveShadow = true;
                },

                //color: 0xc0c0ff,
                createMaterial: () => new THREE.MeshPhysicalMaterial({
                    color: 0xdbf3ff,            // Very pale blue (simulates scattered light)
                    transmission: 0.95,         // Not 1.0, to keep some surface body
                    ior: 1.31,

                    // LIGHT SETTINGS (The "Bright" Fix)
                    attenuationColor: 0x00abff, // The "Deep" blue
                    attenuationDistance: 5.0,   // INCREASE THIS to let more light through

                    roughness: 0.1,             // Lower roughness for clarity
                    metalness: 0.0,

                    // THE "WET/SNOW" LAYER
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.2,    // Rougher top layer looks like melting frost

                    sheen: 1.0,                 // Adds a soft "fuzzy" glow to edges
                    sheenColor: 0xffffff,
                })
            }
        ]
    };

    vertices.forEach(v => {
        v.penguin = -1;
    });

    for (let i = 0; i < count; i++) {

        let startI = randomIndexWhere(vertices, v => v.penguin == -1); //Math.floor(Math.random() * vertices.length);
        vertices[startI].penguin = i;

        let startJ = -1;

        //let n = randomIndexWhere(vertices[startI].vertices, vi => vertices[vi].penguin == -1);

        let n = -1;

        if (n >= 0) {
            startJ = vertices[startI].vertices[n];
            vertices[startJ].penguin = i;
        } else {
            startJ = startI;
            startI = vertices[startI].vertices[0];
        }     

        const value = 128 + Math.floor(Math.random() * 128);
        const grayColor = (value << 16) | (value << 8) | value;

        scene.models.push(createPenguin({
            index: i,
            startI,
            startJ,
            animType: n < 0 ? 1 : 0,
            animChange: n < 0,
            speed: 0.2 + Math.random() / 3.0,
            color: grayColor
        }));
    }

    return scene;
}


function createPenguin(params = {}) {
    let index = params.index;
    let currenti = params.startI;
    let currentj = params.startJ;
    let nextj = 0;
    let speed = params.speed;
    let t0 = -1;
    let t1 = -1;
    let animType = params.animType;
    let animChange = params.animChange;

    function progress(t) {
        if (t0 < 0) {
            t0 = t;
            t1 = t + 1.0 / speed;
        }

        let tt = 0;

        if (Math.abs(t1 - t0) < 0.00001) {
            tt = 2.0;
        } else {
            tt = (t - t0) / (t1 - t0);
        }

        if (tt > 1) {
            t0 = t;
            t1 = t + 1.0 / speed;
            tt = 0;

            animType = (animType + 1) % 3;
            animChange = true;
        }

        return tt;
    }

    return {
        path: 'assets/OnSphere/penguin.ply',
        //color: 0xa0a0a0,
        createMaterial: () => createTwistMaterial(params.color),
        prepareGeometry: g => {
            g.rotateZ(Math.PI);
            g.scale(0.07, 0.07, 0.07);
        },
        prepareMesh: m => {
            m.castShadow = true;
        },
        animate: (m, t) => {

            let tt = progress(t);

            if (animType == 0) {
                if (animChange) {
                    currenti = currentj;
                    currentj = nextj;
                    animChange = false;
                }

                let x1 = vertices[currenti].x;
                let y1 = vertices[currenti].y;
                let z1 = vertices[currenti].z;

                let x2 = vertices[currentj].x;
                let y2 = vertices[currentj].y;
                let z2 = vertices[currentj].z;

                let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, tt);
                updateFigureTransform(m, pos.x, pos.y, pos.z, pos.v1, pos.v2, pos.v3, 0.04);
                m.material.userData.uTwistStrength.value = 30.0 * oscillation1(tt, 80);

                if (tt > 0.5 && vertices[currenti].penguin == index) {
                    vertices[currenti].penguin = -1;
                }
            }

            if (animType == 1) {
                if (animChange) {
                    t1 = t0 + 0.5 * (t1 - t0);
                    animChange = false;
                }

                let x1 = vertices[currenti].x;
                let y1 = vertices[currenti].y;
                let z1 = vertices[currenti].z;

                let x2 = vertices[currentj].x;
                let y2 = vertices[currentj].y;
                let z2 = vertices[currentj].z;

                let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, 1.0);
                updateFigureTransform(m, pos.x, pos.y, pos.z, pos.v1, pos.v2, pos.v3, 0.04);
                m.material.userData.uTime.value = 2 * Math.PI * tt;
            }

            if (animType == 2) {
                if (animChange) {

                    let n = randomIndexWhere(vertices[currentj].vertices, vi => vertices[vi].penguin == -1);

                    if (n < 0) {
                        animType = 1;
                        animChange = true;
                        return;
                    } else {
                        nextj = vertices[currentj].vertices[n];
                        vertices[nextj].penguin = index; 
                    }
                }

                let x1 = vertices[currenti].x;
                let y1 = vertices[currenti].y;
                let z1 = vertices[currenti].z;

                let x2 = vertices[currentj].x;
                let y2 = vertices[currentj].y;
                let z2 = vertices[currentj].z;

                let x3 = vertices[nextj].x;
                let y3 = vertices[nextj].y;
                let z3 = vertices[nextj].z;


                let pos1 = getGeodesicState(x1, y1, z1, x2, y2, z2, 1.0);
                let pos2 = getGeodesicState(x2, y2, z2, x3, y3, z3, 0.0);

                let posv = getGeodesicState(pos1.v1, pos1.v2, pos1.v3, pos2.v1, pos2.v2, pos2.v3, tt);

                if (animChange) {
                    animChange = false;
                    t1 = t0 + 0.5 * (t1 - t0) * Math.abs(posv.totalAngle) / Math.PI;
                }

                updateFigureTransform(m, pos1.x, pos1.y, pos1.z, posv.x, posv.y, posv.z, 0.04);
                m.material.userData.uTwistStrength.value = 20.0 * oscillation1(tt, 80 * (t1 - t0) * speed);
            }
        }
    }
}

function randomIndexWhere(arr, predicate) {
    const eligible = arr.reduce((acc, el, i) => {
        if (predicate(el)) acc.push(i);
        return acc;
    }, []);

    if (eligible.length === 0) return -1; // or null, or throw
    return eligible[Math.floor(Math.random() * eligible.length)];
}

function oscillation1(t, m) {
    const phi = m * (1 - Math.cos(Math.PI * t)) / Math.PI;
    return Math.sin(phi) * t * (1 - t);
}

/*function oscillation2(t, m) {
    const phi = m * (t / 2 - Math.sin(2 * Math.PI * t) / (4 * Math.PI));
    return Math.sin(phi) * t * (1 - t);
}*/

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
 * @returns {Object} {x, y, z, v1, v2, v3, v}
 */
function getGeodesicState(x1, y1, z1, x2, y2, z2, t) {
    // 1. Setup Vectors
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);

    // 2. Define the rotation axis (perpendicular to the path)
    const axis = new THREE.Vector3().crossVectors(p1, p2);

    // Handle cases where points are identical or polar opposites
    //if (axis.lengthSq() < 0.000001) {
    //    return { x: x1, y: y1, z: z1, v1: 0, v2: 0, v3: 0 };
    //}
    // --- STABLE ANTIPODAL HANDLING ---
    if (axis.lengthSq() < 0.000001) {
        // Case: Points are identical
        if (p1.distanceTo(p2) < 0.0001) {
            return { x: x1, y: y1, z: z1, v1: 0, v2: 0, v3: 0, speed: 0, totalAngle: 0 };
        }

        // Case: Points are opposites. 
        // We need an axis perpendicular to p1. 
        // Logic: find the smallest component of p1 and cross with that basis vector.
        // This is deterministic and won't flip-flop.
        const ax = Math.abs(p1.x);
        const ay = Math.abs(p1.y);
        const az = Math.abs(p1.z);

        if (ax <= ay && ax <= az) axis.set(0, -p1.z, p1.y);
        else if (ay <= ax && ay <= az) axis.set(-p1.z, 0, p1.x);
        else axis.set(-p1.y, p1.x, 0);
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
    //const velocity = direction.clone().multiplyScalar(Math.max(speed, 0.0001));

    return {
        x: posAtT.x,
        y: posAtT.y,
        z: posAtT.z,
        v1: direction.x,
        v2: direction.y,
        v3: direction.z,
        v: speed,
        totalAngle: totalAngle 
    };
}

function createTwistMaterial(baseColorHex) {
    // 1. Create standard material (keeps your lighting/colors)
    const material = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        flatShading: false,
        vertexColors: false,
        metalness: 0.4,
        roughness: 0.5
    });

    // 2. Define uniforms to pass data from JS to the Shader
    material.userData.uTime = { value: 0 };
    material.userData.uTwistStrength = { value: 0.0 };

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
                transformed.x * uTwistStrength; 
            
            float s = sin(angle);
            float c = cos(angle);
            
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.yz = rotationMatrix * transformed.yz;


            angle = 1.1 *
                smoothstep(0.0, 0.03, transformed.z) *
                sin(uTime);
            s = sin(angle);
            c = cos(angle);

            rotationMatrix = mat2(c, -s, s, c);

            transformed.xy = rotationMatrix * transformed.xy;

            `
        );
    };

    return material;
}
