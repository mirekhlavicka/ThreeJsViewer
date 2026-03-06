import * as THREE from 'three';
import { triangle01, sinSmooth, goldMaterial } from './utils.js?v=1.12';

import { catMoldScene } from './scenes/catMold.js?v=1.12';
import { eggEarthContainerScene } from './scenes/eggEarthContainer.js?v=1.12';
import { createEarthMold2Scene, createEarthMold4Scene } from './scenes/earthMold.js?v=1.12';
import { dogCatScene, openHeartScene, goldHeartScene, bikeHeartScene } from './scenes/heart.js?v=1.12';

import { createBottleLidScene } from './scenes/bottle.js?v=1.01';

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
        name: "PO in horse",
        setup: (camera) => {
            camera.position.set(1, -3, 1.25);
        },
        models: [
            {
                path: 'assets/Horse/Horse2.ply',
                //color: 0xC79F70,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.6);
                    v = sinSmooth(v, 0, 1.4);
                    m.position.x = 1.0 * v;

                    v = 1.8 * triangle01(t, 10);
                    v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                    v = sinSmooth(v, 0, 1.2);
                    m.rotation.z = (Math.PI / 2) * v / 1.2;
                },
                createMaterial: () => new THREE.MeshPhysicalMaterial({
                    thickness: 0.5,        // Depth of the glass
                    roughness: 0.0,        // Perfectly smooth
                    transmission: 1.0,     // 100% of light passes through
                    ior: 1.5,             // Index of Refraction (1.5 is standard for glass)
                    opacity: 1,           // Keep this at 1; transmission handles transparency
                    transparent: true,    // Must be true for transmission to work
                    envMapIntensity: 1.5,
                    color: 0xC79F70
                })
            },
            {
                path: 'assets/Horse/Horse1.ply',
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
                path: 'assets/Horse/PO.ply',
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

    createEarthMold2Scene("Earth mold 2 a", "earth", "earthIn", "earthOut"),
    //createEarthMold2Scene("Earth mold 2 a normal", "earth", "earthIn", "earthOut", false, true),
    createEarthMold2Scene("Earth mold 2 b", "earth", "earthOut1", "earthIn1"),
    createEarthMold2Scene("Egg Earth mold 2 a", "eggearth/m", "eggearth/m1", "eggearth/m2", true),
    createEarthMold2Scene("Egg Earth mold 2 b", "eggearth/m", "eggearth/ma", "eggearth/mb", true),

    createEarthMold4Scene("Earth mold 4", "earth", "earth00", "earth01", "earth10", "earth11"),
    createEarthMold4Scene("Earth mold 4 hole", "earth", "earth00h", "earth01h", "earth10h", "earth11h"),
    createEarthMold4Scene("Egg Earth mold 4", "eggearth/m", "eggearth/m00", "eggearth/m01", "eggearth/m10", "eggearth/m11", true),
    createEarthMold4Scene("Egg Earth mold 4 hole", "eggearth/m", "eggearth/m00h", "eggearth/m01h", "eggearth/m10h", "eggearth/m11h", true),

    createBottleLidScene("Bottle with Arnold as lid 1", "bottle", "arnoldCap1"),
    createBottleLidScene("Bottle with Arnold as lid 2", "bottle", "arnoldCap2"),

    dogCatScene,
    openHeartScene,
    goldHeartScene,
    bikeHeartScene,

    catMoldScene,
    eggEarthContainerScene
];