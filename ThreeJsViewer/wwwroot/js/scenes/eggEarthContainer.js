import { triangle01, sinSmooth } from '../utils.js';
import * as THREE from 'three';

export const eggEarthContainerScene = {
    name: "Earth/Egg Container",
    models: [
        {
            path: 'assets/EggEarthContainer/eggbottom.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: g => globeColors(g, true)
        },
        {
            path: 'assets/EggEarthContainer/eggtop.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: g => globeColors(g, true),
            animate: (m, t) => {

                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);

                m.position.z = v;
                v = Math.max(v - 0.2, 0);
                m.rotation.y = (Math.PI / 2) * v / 1.2;
            }
        }
    ]
}

function globeColors(geometry, egg) {
    const pos = geometry.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    // 1. Find the Min/Max radius to establish a scale
    let minR = Infinity;
    let maxR = -Infinity;
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {

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
        if (r > 0.95) {
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
        }
    }

    // 2. Define our "Palette" points
    const colorHell = new THREE.Color(0xaa0000); // Red
    const colorWaterDeep = new THREE.Color(0x050a30); // Dark Blue
    const colorWaterShallow = new THREE.Color(0x005b96); // Light Blue
    const colorSand = new THREE.Color(0xc2b280); // Sand
    const colorGrass = new THREE.Color(0x228b22); // Forest Green
    const colorMountain = new THREE.Color(0x4b3621); // Dark Brown
    const colorSnow = new THREE.Color(0xffffff); // White

    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
        // Normalize radius between 0 and 1
        let h = (radii[i] - minR) / (maxR - minR);

        //if (h < 0) h = 0;

        /*if (h < 0 && pos.getZ(i) < -0.8) {
            tempColor.lerpColors(colorWaterDeep, colorWaterShallow, h / 0.45);
        } else if (h < 0) {
            tempColor.copy(colorHell);
        } else */if (h < 0.45) {
            // Ocean gradient
            tempColor.lerpColors(colorWaterDeep, colorWaterShallow, h / 0.45);
        } else if (h < 0.50) {
            // Coastline/Beach
            tempColor.copy(colorSand);
        } else if (h < 0.75) {
            // Land gradient (Green to Brown)
            const t = (h - 0.50) / 0.25;
            tempColor.lerpColors(colorGrass, colorMountain, t);
        } else {
            // High Peaks (Brown to Snow)
            const t = (h - 0.75) / 0.25;
            tempColor.lerpColors(colorMountain, colorSnow, t);
        }

        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}