import * as THREE from 'three';
import { triangle01, sinSmooth, goldMaterial } from './utils.js';
import { catMoldScene } from './scenes/catMold.js';
import { earthMold2Scene, earthMold4Scene } from './scenes/earthMold.js';

export const sceneConfigurations = [

    {
        name: "Pear container",
        models: [
            {
                path: 'assets/Pear - bottom.ply',
                color: 0xC9CC3F
            },
            {
                path: 'assets/Pear - top.ply',
                color: 0xC9CC3F,
                animate: (m, t) => {
                    let v = 0.5 * (1.0 + Math.sin(0.5 * t));
                    m.position.z = v;
                    m.rotation.x = v;
                }
            }
        ]
    },

    {
        name: "Shrek layers",
        models: [
            {
                path: 'assets/ShrekSDFIn.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.y = -v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = (Math.PI / 2) * v / 1.2;
                }
            },
            {
                path: 'assets/ShrekSDFOut.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.y = v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = -(Math.PI / 2) * v / 1.2;
                }
            }
        ]
    },

    {
        name: "Star ball",
        models: [
            {
                path: 'assets/StarBall1.ply',
                color: 0xffd700,
                setupMaterial: goldMaterial
            },
            {
                path: 'assets/StarBall.ply',
                color: 0xffd700,
                setupMaterial: goldMaterial,
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
    },

    {
        name: "Bunny in bunny",
        setup: (camera) => {
            camera.position.set(3, 0, 1.5);
        },
        models: [
            {
                path: 'assets/mold/BunnyOut.ply',
                glass: true,
                //color: 0xB0C400,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.y = 1.5 * v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = (Math.PI / 2) * v / 1.2;
                }
            },
            {
                path: 'assets/mold/BunnyIn.ply',
                glass: true,
                //color: 0xB0C400,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.y = - 1.5 * v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = -(Math.PI / 2) * v / 1.2;
                }
            },
            {
                path: 'assets/mold/Bunny.ply',
                color: 0xB28A6B,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);

                    v = 0.25 + 0.75 * v / 1.4;

                    m.scale.set(v, v, v);

                    m.position.z = - (1 - v) / 2 - 0.1;
                    /*v = Math.max(v - 0.2, 0);
                    m.rotation.z = -(Math.PI / 2) * v / 1.2;*/
                }
            }

        ]
    },

    {
        name: "Dog & cat Valentine's day",
        setup: (camera) => {
            camera.position.set(0, -3, 2);
        },
        models: [
            {
                path: 'assets/Labrador and cat - heart.ply',
                color: 0xff69b4, // Hot Pink
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.y = -0.75 * v;
                    m.rotation.y = (2 * Math.PI) * v / 1.6;
                }
            },
            {
                path: 'assets/Labrador and cat.ply'
            }
        ]
    },

    {
        name: "Open heart",
        setup: (camera) => {
            camera.position.set(0, 3, 1);
        },
        models: [
            {
                path: 'assets/heart/Open heart in.ply',
                color: 0xff69b4,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.x = -v;
                    v = Math.max(v - 0.2, 0);
                    v = sinSmooth(v, 0, 1.4);
                    m.rotation.z = (Math.PI / 2) * v / 1.4;
                }
            },
            {
                path: 'assets/heart/Open heart out.ply',
                color: 0xff69b4,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.x = v;
                    v = Math.max(v - 0.2, 0);
                    v = sinSmooth(v, 0, 1.4);
                    m.rotation.z = -(Math.PI / 2) * v / 1.4;
                }
            }
        ]
    },

    {
        name: "Gold heart",
        setup: (camera) => {
            camera.position.set(0, 3, 1);
        },
        models: [
            {
                path: 'assets/heart/Open heart in1.ply',
                //color: 0xff69b4,
                color: 0xffd700,
                setupMaterial: goldMaterial,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.x = -v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = (Math.PI / 2) * v / 1.4;
                }
            },
            {
                path: 'assets/heart/Open heart out1.ply',
                //color: 0xff69b4,
                color: 0xffd700,
                setupMaterial: goldMaterial,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.x = v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.z = -(Math.PI / 2) * v / 1.4;
                }
            }
        ]
    },

    {
        name: "Bike in heart",
        setup: (camera) => {
            camera.position.set(-2, -1, 3);
        },
        models: [
            {
                path: 'assets/heart/BikeInHeart.ply',
                color: 0xff69b4,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);
                    m.position.z = v;
                    v = Math.max(v - 0.2, 0);
                    m.rotation.x = (Math.PI / 2) * v / 1.4;
                }
            },
            {
                path: 'assets/heart/BikeInHeart1.ply',
                color: 0xff69b4
            }
        ]
    },

    {
        name: "PO in horse",
        setup: (camera) => {
            camera.position.set(1, -3, 1.25);
        },
        models: [
            {
                path: 'assets/horse/horse2.ply',
                glass: true,
                color: 0xC79F70,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.x = 1.0 * v;

                    v = 1.8 * triangle01(t, 10);
                    v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                    v = sinSmooth(v, 0, 1.2);
                    m.rotation.z = (Math.PI / 2) * v / 1.2;
                }
            },
            {
                path: 'assets/horse/horse1.ply',
                color: 0xD5D2AC,
                //glass: true,
                //color: 0xC4A484,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.x = - 1.0 * v;

                    v = 1.8 * triangle01(t, 10);
                    v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                    v = sinSmooth(v, 0, 1.2);
                    m.rotation.z = -(Math.PI / 2) * v / 1.2;                    
                }
            },
            {
                path: 'assets/horse/po.ply',
                prepareGeometry/*prepareMesh*/: geometry => {
                    /*m.rotation.x = Math.PI / 2;
                    m.scale.set(0.19, 0.19, 0.19);*/
                    // 1. Bake rotation into the vertices
                    geometry.rotateX(Math.PI / 2);

                    // 2. Bake scale into the vertices
                    geometry.scale(0.19, 0.19, 0.19);
                },
                color: 0xB87A1B,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                    v = sinSmooth(v, 0, 1.2);

                    m.rotation.z = (4.2* Math.PI ) * v / 1.2;                    

                    m.position.x = v / 2;
                    m.position.y = -1.8 * v - 0.1;
                    m.position.z = 0.08 + 0.8 * v;
                }
            }

        ]
    },

    earthMold2Scene,

    earthMold4Scene,

    catMoldScene
];