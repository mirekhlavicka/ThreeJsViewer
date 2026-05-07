import { triangle01, sinSmooth, smoothAnim, goldMaterial } from '../../utils.js';
import * as THREE from 'three';

export function createPenguinPrintScene() {
    return {
        name: "Penguins/Penguin print",
        models: [
            {
                path: 'assets/penguin/bottom.ply',
                color: 0x808080
            },
            {
                path: 'assets/penguin/top.ply',
                color: 0xffffff,
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
    };
}       
