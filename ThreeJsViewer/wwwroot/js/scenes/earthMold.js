import { triangle01, sinSmooth, smoothAnim, globeColors } from '../utils.js';

export const earthMold2Scene = {
    name: "Earth/Earth mold two parts",
    setup: (camera) => {
        camera.position.set(3, 0, 1.5);
    },
    models: [
        {
            path: 'assets/mold/EarthIn.ply',
            color: 0x8CB1DE,
            animate: (m, t) => {
                m.position.y = -2.0 * smoothAnim(t, 10, 0.5, 4.5);
                let v = smoothAnim(t, 10, 1, 4.5);
                m.rotation.z = -(Math.PI / 2) * v;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/EarthOut.ply',
            color: 0x8CB1DE,
            animate: (m, t) => {
                m.position.y = 2.0 * smoothAnim(t, 10, 0.5, 4.5);
                let v = smoothAnim(t, 10, 1, 4.5);
                m.rotation.z = (Math.PI / 2) * v;
                m.position.x = -0.5 * v;
            }
        },
        {
            path: 'assets/mold/Earth.ply',
            color: 0xDADD63,
            animate: (m, t) => {
                let v = smoothAnim(t, 10, 1, 4.5);
                m.rotation.z = (2 * Math.PI) * v;
            },
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: globeColors
        }
    ]
};

function createeggEarthMold2Scene(version) {
    return {
        name: "Earth/Egg  mold two parts " + version,
        setup: (camera) => {
            camera.position.set(3, 0, 1.5);
        },
        models: [
            {
                path: `assets/mold/eggearth/m${version == 1 ? "a" : "1"}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => {
                    m.position.y = -2.0 * smoothAnim(t, 10, 0.5, 4.5);
                    let v = smoothAnim(t, 10, 1, 4.5);
                    m.rotation.z = -(Math.PI / 2) * v ;
                    m.position.x = -0.5 * v;
                }
            },
            {
                path: `assets/mold/eggearth/m${version == 1 ? "b" : "2"}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => {
                    m.position.y = 2.0 * smoothAnim(t, 10, 0.5, 4.5);
                    let v = smoothAnim(t, 10, 1, 4.5);
                    m.rotation.z = (Math.PI / 2) * v ;
                    m.position.x = -0.5 * v;
                }
            },
            {
                path: 'assets/mold/eggearth/m.ply',
                color: 0xDADD63,
                animate: (m, t) => {
                    let v = smoothAnim(t, 10, 1, 4.5);
                    m.rotation.z = (2 * Math.PI) * v ;
                },
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                },
                prepareGeometry: g => globeColors(g, true)
            }

        ]
    };
}       

export const eggEarthMold2Scene = createeggEarthMold2Scene(1);
export const eggEarthMold2Scene1 = createeggEarthMold2Scene(2);


export const earthMold4Scene = {
    name: "Earth/Earth mold four parts",
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

export const eggEarthMold4Scene = {
    name: "Earth/Egg mold four parts",
    setup: (camera) => {
        camera.position.set(3, 0, 1.5);
    },
    models: [
        {
            path: 'assets/mold/eggearth/m00.ply',
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
            path: 'assets/mold/eggearth/m01.ply',
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
            path: 'assets/mold/eggearth/m10.ply',
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
            path: 'assets/mold/eggearth/m11.ply',
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
            path: 'assets/mold/eggearth/m.ply',
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
            prepareGeometry: g => globeColors(g, true)
        }

    ]
};
