import { triangle01, sinSmooth, globeColors } from '../utils.js';

export const earthMold2Scene = {
    name: "Earth mold two parts",
    setup: (camera) => {
        camera.position.set(3, 0, 1.5);
    },
    models: [
        {
            path: 'assets/mold/EarthOut.ply',
            color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = (Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/EarthIn.ply',
            color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = - 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = -(Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/Earth.ply',
            color: 0xDADD63,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = (2 * Math.PI) * v / 1.2;

            },
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: globeColors
        }

    ]
};

export const earthMold4Scene = {
    name: "Earth mold four parts",
    setup: (camera) => {
        camera.position.set(3, 0, 1.5);
    },
    models: [
        {
            path: 'assets/mold/earth00.ply',
            //color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = (Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;

                v = Math.max(v - 0.3, 0);
                v = sinSmooth(v, 0, 0.9);
                m.position.y += 0.6 * v;
            }
        },
        {
            path: 'assets/mold/earth01.ply',
            //color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = - 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = -(Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;

                v = Math.max(v - 0.3, 0);
                v = sinSmooth(v, 0, 0.9);
                m.position.y -= 0.6 * v;
            }
        },
        {
            path: 'assets/mold/earth10.ply',
            //color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = (Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/earth11.ply',
            //color: 0x8CB1DE,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                v = sinSmooth(v, 0, 1.4);
                m.position.y = - 1.5 * v;

                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = -(Math.PI / 2) * v / 1.2;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/Earth.ply',
            color: 0xDADD63,
            animate: (m, t) => {
                let v = 1.8 * triangle01(t, 10);
                v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                v = sinSmooth(v, 0, 1.2);
                m.rotation.z = (2 * Math.PI) * v / 1.2;

            },
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: globeColors
        }

    ]
};