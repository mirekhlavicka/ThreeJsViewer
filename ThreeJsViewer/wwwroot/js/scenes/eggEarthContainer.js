import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export const eggEarthContainerScene = {
    name: "Earth/Egg Container",
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
                m.position.y = 0.05 * Math.sin(25 * smoothAnim(t, 15, 0, 2.8));
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
                m.position.y = 0.05 * Math.sin(25 * smoothAnim(t, 15, 0, 2.8));
                m.position.z = 0.8 * smoothAnim(t, 15, 1.5, 4.5);
                m.rotation.y = (Math.PI / 4) * smoothAnim(t, 15, 2.5, 4.5);
                m.rotation.x = (Math.PI / 6) * smoothAnim(t, 15, 3.5, 4.5);
            }
        },
        {
            path: 'assets/EggEarthContainer/dragon.ply',
            color: 0xF8E47E,
            prepareGeometry: g => {
                g.rotateZ(-Math.PI / 2);
                g.scale(0.5, 0.5, 0.5);
            },
            animate: (m, t) => {
                m.position.y = 0.05 * Math.sin(25 * smoothAnim(t, 15, 0, 2.8));
                m.position.z = 1.0 * smoothAnim(t, 15, 1.5, 4.5);
                m.rotation.z = (1.8 * Math.PI) * smoothAnim(t, 15, 2.5, 4.5);

                m.position.x = -1.5 * smoothAnim(t, 15, 4.5, 7.5);
                m.position.y = 1.5 * smoothAnim(t, 15, 4.5, 7.5);
                m.rotation.y = (-0.25 * Math.PI) * smoothAnim(t, 15, 4.5, 7.5);;
            }
        }
    ]
}
function prepareGeometry(g) {
    g.rotateZ(-0.9 * Math.PI);
    globeColors(g, true)
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