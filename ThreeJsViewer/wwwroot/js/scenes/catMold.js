import { triangle01, sinSmooth } from '../utils.js';

export const catMoldScene = {
    name: "Cat mold",
    setup: (camera) => {
        camera.position.set(1, -3, 1.5);
    },
    models: [
        {
            path: 'assets/cat/m.ply',
            color: 0x904617
        },
        {
            path: 'assets/cat/m1.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = - 1.0 * v;
            }
        },
        {
            path: 'assets/cat/m2a.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = - 0.9 * v;
                m.position.z = 0.05 * v;

                m.rotation.x = -0.3 * (Math.PI / 2) * v;
            }
        },
        {
            path: 'assets/cat/m2b.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = - 0.25 * v;
            }
        },
        {
            path: 'assets/cat/m3a.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.6 + Math.min(Math.max(v, 0.6), 1.6);
                v = sinSmooth(v, 0, 1.0);
                //m.position.x =  0.25 * v;
                m.position.y = -0.35 * v;
                m.position.z = 0.25 * v;
                m.rotation.x = -0.2 *(Math.PI / 2) * v;
            }
        },
        {
            path: 'assets/cat/m3b.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.6 + Math.min(Math.max(v, 0.6), 1.6);
                v = sinSmooth(v, 0, 1.0);
                m.position.x = 0.25 * v;
                m.position.y = 0.1 * v;
            }
        },
        {
            path: 'assets/cat/m4a.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = 0.5 * v;
            }
        },
        {
            path: 'assets/cat/m4b.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = 0.25 * v;
            }
        },
        {
            path: 'assets/cat/m5.ply',
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.x = + 1.0 * v;
            }
        }
    ]
};