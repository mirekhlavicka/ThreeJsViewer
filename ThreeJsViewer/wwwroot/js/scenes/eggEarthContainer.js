import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

const eggPeriod = 18;
export const eggEarthContainerScene = {
    name: "Earth/Dragon egg",
    resetTime: 2*eggPeriod,
    models: [
        {
            path: 'assets/EggEarthContainer/eggbottom1.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: prepareGeometry,
            animate: (m, t) => {
                earthquake(m, t);
            }
        },
        {
            path: 'assets/EggEarthContainer/eggtop1.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: prepareGeometry,
            animate: (m, t) => {
                earthquake(m, t);

                m.position.z += 0.9 * smoothAnim(t, eggPeriod, 1.5, 4.5);
                m.rotation.y = (Math.PI / 4) * smoothAnim(t, eggPeriod, 2.5, 4.5);
                m.rotation.x = (Math.PI / 6) * smoothAnim(t, eggPeriod, 3.5, 4.5);
            }
        },
        {
            path: 'assets/EggEarthContainer/dragon.ply',
            color: 0xF8E47E,
            prepareGeometry: g => {
                g.rotateZ(-Math.PI / 2);
                g.scale(0.5, 0.5, 0.5);
            },
            createMaterial: () => createTwistMaterial(0xF8E47E),
            animate: (m, t) => {
                m.material.userData.uTime.value = t;
                updateDragonAnimation(m, t);
            }
        }
    ]
}
function prepareGeometry(g) {
    g.rotateZ(-0.9 * Math.PI);
    globeColors(g, true)
}

function earthquake(m, t) {
    m.position.y = 0.02 * Math.sin(25 * smoothAnim(t, eggPeriod, 1, 2));
    m.position.x = 0.03 * Math.sin(17 * smoothAnim(t, eggPeriod, 1, 2));
    m.position.z = 0.03 * Math.sin(21 * smoothAnim(t, eggPeriod, 1, 2));
}

function globeColors(geometry, egg) {
    const pos = geometry.attributes.position;
    const originalColors = geometry.attributes.color;
    const count = pos.count;
    const newColors = new Float32Array(count * 3);
    const radii = new Float32Array(count);

    let minR = Infinity;
    let maxR = -Infinity;

    // 1. Establish the Elevation Scale (Earth Surface Only)
    for (let i = 0; i < count; i++) {
        const rVal = originalColors.getX(i);
        const gVal = originalColors.getY(i);
        const bVal = originalColors.getZ(i);

        // YOUR TEST: Check if this vertex is part of the Earth surface
        const isEarth = (rVal > 0.9 && gVal > 0.2 && gVal < 0.25 && bVal > 0.2 && bVal < 0.25);

        if (isEarth) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            if (egg) {
                let s1 = 1.2;
                let s2 = 1.7;
                let s = s1 + (s2 - s1) * (z + 1) / 2;
                x *= s; y *= s;
            }

            const r = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
            radii[i] = r;

            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
        }
    }

    minR = 0.9517397714244147;
    maxR = 1.02212966480691;

    // 2. Define Palette
    const colorWaterDeep = new THREE.Color(0x050a30);
    const colorWaterShallow = new THREE.Color(0x005b96);
    const colorSand = new THREE.Color(0xc2b280);
    const colorGrass = new THREE.Color(0x228b22);
    const colorMountain = new THREE.Color(0x4b3621);
    const colorSnow = new THREE.Color(0xffffff);

    const tempColor = new THREE.Color();

    // 3. Set Final Colors
    for (let i = 0; i < count; i++) {
        const rVal = originalColors.getX(i);
        const gVal = originalColors.getY(i);
        const bVal = originalColors.getZ(i);

        const isEarth = (rVal > 0.9 && gVal > 0.2 && gVal < 0.25 && bVal > 0.2 && bVal < 0.25);

        if (isEarth) {
            // Calculate terrain height based on the minR/maxR of the surface only
            const h = (radii[i] - minR) / (maxR - minR);

            if (h < 0.42) {
                tempColor.lerpColors(colorWaterDeep, colorWaterShallow, h / 0.42);
            } else if (h < 0.50) {
                tempColor.copy(colorSand);
            } else if (h < 0.75) {
                const t = (h - 0.50) / 0.25;
                tempColor.lerpColors(colorGrass, colorMountain, t);
            } else {
                const t = (h - 0.75) / 0.25;
                tempColor.lerpColors(colorMountain, colorSnow, t);
            }
        } else {
            // Non-earth parts (hollow/mold) set to pure White
            tempColor.set(0xffffff);
        }

        newColors[i * 3] = tempColor.r;
        newColors[i * 3 + 1] = tempColor.g;
        newColors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
    geometry.attributes.color.needsUpdate = true;
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
    material.userData.uTwistStrength = { value: 1.5 };

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
            
            // Calculate angle based on height (y) and time
            // sin(uTime) makes it breathe back and forth
            float angle =
                smoothstep(-0.5, 0.2, transformed.z) *
                smoothstep(-0.2, 0.2, transformed.x) *
                transformed.y * uTwistStrength * sin(uTime * 4.0 - (transformed.x * 0.5));
            
            float s = sin(angle);
            float c = cos(angle);
            
            // Apply 2D rotation matrix to X and Z coordinates
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.xy = rotationMatrix * transformed.xy;


            angle = 0.4 *
                smoothstep(-0.2, 0.0, transformed.z) *
                (1.0 - smoothstep(0.2, 0.5, transformed.x)) *
                sin(uTime * 2.0);
            s = sin(angle);
            c = cos(angle);

            // Apply 2D rotation matrix to X and Z coordinates
            rotationMatrix = mat2(c, -s, s, c);

            transformed.xy = rotationMatrix * transformed.xy;

            `
        );
    };

    return material;
}

// Variables to track the "Orbit" state
let orbitRadius = 0;
let initialOrbitAngle = 0;

function updateDragonAnimation(mesh, time) {
    if (time < 2.5) return;

    // Configuration for the "Return" trip
    const rotations = 1; // X rotations
    const orbitDuration = (Math.PI * 2 * rotations) / 0.5 /*+ 4.0*/; // Adding the 4s ease-in time
    const phase4End = 10.5 + orbitDuration;

    // 1. PHASE 1: 1.5s to 4.5s (Rise and Rotate)
    if (time < 5.5) {
        let t = THREE.MathUtils.smoothstep((time - 2.5) / 3, 0, 1);
        mesh.position.z = THREE.MathUtils.lerp(0, 1.0, t);
        mesh.rotation.z = -THREE.MathUtils.lerp(0, Math.PI / 4, t);
    }

    // 2. PHASE 2: 4.5s to 7.5s (Move Radially Forward)
    else if (time < 8.5) {
        let t = THREE.MathUtils.smoothstep((time - 5.5) / 3, 0, 1);
        const distance = THREE.MathUtils.lerp(0, 1.5, t);
        const angle = Math.PI - Math.PI / 4;

        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.y = Math.sin(angle) * distance;
        mesh.position.z = 1.0 - (THREE.MathUtils.smoothstep(t, 0.5, 1) / 2.0);

        orbitRadius = 1.5;
        initialOrbitAngle = angle;
    }

    // 3. PHASE 3: 7.5s to 9.5s (Local Rotation for Orbit Entry)
    else if (time < 10.5) {
        let t = THREE.MathUtils.smoothstep((time - 8.5) / 2, 0, 1);
        mesh.rotation.z = -Math.PI / 4 + THREE.MathUtils.lerp(0, Math.PI / 2, t);
    }

    // 4. PHASE 4: 10.5s to phase4End (The Global Orbit)
    else if (time < phase4End) {
        const orbitTime = time - 10.5;

        // 1. Calculate how far through the phase we are (0.0 to 1.0)
        let progress = orbitTime / orbitDuration;

        // 2. Apply S-Curve to the progress itself
        // This ensures velocity is 0 at start AND 0 at the end
        const smoothProgress = THREE.MathUtils.smoothstep(progress, 0, 1);

        // 3. Calculate total distance to travel (Total Radians)
        const totalAngleToTravel = Math.PI * 2 * rotations;

        // 4. Determine current angle
        const currentAngle = initialOrbitAngle + (smoothProgress * totalAngleToTravel);

        mesh.position.x = Math.cos(currentAngle) * orbitRadius;
        mesh.position.y = Math.sin(currentAngle) * orbitRadius;
        mesh.rotation.z = currentAngle - Math.PI / 2;

        // Sync for Phase 5
        mesh.userData.finalOrbitAngle = currentAngle;
    }
    // 5. PHASE 5: (Local Rotation for Return) - Mirror Phase 3
    else if (time < phase4End + 2.0) {
        let t = THREE.MathUtils.smoothstep((time - phase4End) / 2, 0, 1);
        const startAng = mesh.userData.finalOrbitAngle + - Math.PI / 2;

        // Dragon turns back to face the center
        mesh.rotation.z = startAng + THREE.MathUtils.lerp(0, Math.PI / 2, t);
    }

    // 6. PHASE 6: (Move Radially Back) - Mirror Phase 2
    else if (time < phase4End + 5.0) {
        let t = THREE.MathUtils.smoothstep((time - (phase4End + 2.0)) / 3, 0, 1);
        const distance = THREE.MathUtils.lerp(1.5, 0, t);
        const angle = mesh.userData.finalOrbitAngle; // Keep the angle where it stopped

        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.y = Math.sin(angle) * distance;
        //mesh.position.z = 0.75 + (t / 4.0); // Returning to 1.0 height
        mesh.position.z = 0.5 + (THREE.MathUtils.smoothstep(t, 0.0, 0.5) / 2.0);
    }

    // 7. PHASE 7: (Descend) - Mirror Phase 1
    else if (time < phase4End + 8.0) {
        let t = THREE.MathUtils.smoothstep((time - (phase4End + 5.0)) / 3, 0, 1);
        mesh.position.z = THREE.MathUtils.lerp(1.0, 0, t);
        // Slowly return rotation.z to 0 or its original state
        mesh.rotation.z = mesh.userData.finalOrbitAngle - 0.75 * t * Math.PI;//mesh.rotation.z * (1.0 - t/2);
    }
}