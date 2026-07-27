import * as THREE from 'three';
import { triangle01, sinSmooth, goldMaterial } from './utils.js?v=1.12';

import { catMoldScene } from './scenes/catMold.js?v=1.12';
import { eggEarthContainerScene } from './scenes/eggEarthContainer.js?v=1.14';
import { createEarthMold2Scene, createEarthMold4Scene } from './scenes/earthMold.js?v=1.12';
import { dogCatScene, openHeartScene, goldHeartScene, bikeHeartScene } from './scenes/heart.js?v=1.12';
import { createBottleLidScene } from './scenes/bottle.js?v=1.01';

import { createPenguinScene } from './scenes/penguin/penguin.js?v=1.02';
import { createPenguinPrintScene } from './scenes/penguin/penguinPrint.js?v=1.02';

import { createGeoPenguinScene } from './scenes/geodesic/penguin.js?v=1.10';
import { tetraFunc, balls, ballMinusBalls, ballPlusMinusBalls, torusPlusMinusBalls, geodesicSphere, dodecaMinusBalls, dice, ORFuncs, ORManyFuncs, ANDFuncs, ANDManyFuncs } from './scenes/geodesic/implicitLib.js?v=1.10';

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
    eggEarthContainerScene,

    createPenguinScene(10, 5, 6, "Penguin planet"),
    createPenguinScene(10, 5, 6, "Penguin planet - shadows", true),
    createPenguinScene(2, 2, 6, "Penguin planet train"),

    createPenguinPrintScene(2, 2, 6, "Penguin planet train"),

    //********* GeoPenguin ********

    createGeoPenguinScene("Ball", "ball", (x, y, z) => (x * x + y * y + z * z) - 1, 5, true, 0.6, 1.0, false, 5),

    createGeoPenguinScene("4-ball", "ball4", (x, y, z) => (x ** 4 + y ** 4 + z ** 4) - 1, 10, true, 0.6, 1.0, false, 5),

    createGeoPenguinScene("8-ball", "ball8", (x, y, z) => (x ** 8 + y ** 8 + z ** 8) - 1, 8, true, 0.6, 0.8, false, 8),

    createGeoPenguinScene("6-ball", "ball6minuscylinder",
        ANDFuncs(
            (x, y, z) => (x ** 6 + y ** 6 + z ** 6) - 1,
            (x, y, z) => -x * x - y * y + 0.19,
            0.2
        ), 10, true, 0.6, 0.8, true, 10, 0.999, 0),

    createGeoPenguinScene("Ellipsoid", "ellipsoid", (x, y, z) => (8 * x * x + 8 * y * y + z * z) - 1, 5, true, 0.8, 0.8, false, 3, 0.999, 0),

    createGeoPenguinScene("Ellipsoids", "ellipsoidsSharpBlue",
        ORManyFuncs([
                (x, y, z) => (8 * x * x + 8 * y * y + z * z) - 1,
                (x, y, z) => (8 * x * x + y * y + 8 * z * z) - 1,
                (x, y, z) => (x * x + 8 * y * y + 8 * z * z) - 1
            ], 0.2),
        10, true, 1.0, 0.8, true, 10),


    createGeoPenguinScene("Ball minus cylinders", "ballminuscylinders",
        ANDManyFuncs([
            (x, y, z) => x * x + y * y + z * z - 1,
            (x, y, z) => -x * x - y * y - z * z + 23.0 / 64.0,
            (x, y, z) => -(x + 16.0 / 25.0) * (x + 16.0 / 25.0) - (y - 16.0 / 25.0) * (y - 16.0 / 25.0) + 0.23,
            (x, y, z) => -(y + 16.0 / 25.0) * (y + 16.0 / 25.0) - (z + 16.0 / 25.0) * (z + 16.0 / 25.0) + 0.23,
            (x, y, z) => -(z - 16.0 / 25.0) * (z - 16.0 / 25.0) - (x - 16.0 / 25.0) * (x - 16.0 / 25.0) + 0.23
        ], 0.1),
        10, true, 1.0, 0.8, true, 10, 0.999, 0),


    createGeoPenguinScene("Ball minus balls", "ballminusballs1",
        ballMinusBalls()
        , 10, true, 1.3, 0.8, true, 30, 0.999, 0.01),

    createGeoPenguinScene("Ball plus-minus balls", "ballplusminusballs",
        ballPlusMinusBalls()
        , 10, true, 1.3, 0.8, true, 30, 0.9995, 0.008),


    createGeoPenguinScene("Geodesic sphere", "geodesicsphere",
        geodesicSphere()
        , 10, true, 1.3, 0.8, true, 10),

    createGeoPenguinScene("Dodecahedron", "dodecahedronminusballs",
        dodecaMinusBalls()
        , 8, true, 1.3, 0.8, true, 32),


    createGeoPenguinScene("Torus", "torus", (x, y, z) => (x ** 2 + y ** 2 + z ** 2 + (0.7) ** 2 - (0.3) ** 2) ** 2 - 4 * (0.7) ** 2 * (x ** 2 + y ** 2), 10, true, 1.0, 0.8, false, 10, 0.999, 0),

    createGeoPenguinScene("Torus with balls", "torusballs",
        ORFuncs(
            (x, y, z) => (Math.sqrt(x * x + y * y) - 0.70) ** 2 + z * z - 0.0315,
            balls(6, 0.7, Math.sqrt(0.1), 2, 0.01),
            0.02
        )
        , 10, true, 1.2, 0.8, true, 10, 0.9995, 0.008, p => {
            let r = p.clone();
            r.z = 0;
            r.setLength(1.2 * 0.70);
            r.sub(p).normalize();

            return r;
        }),

    createGeoPenguinScene("Torus plus-minus balls", "torusplusminusballs",
        torusPlusMinusBalls()
        , 10, true, 1.2, 0.8, true, 15, 0.9995, 0.008, p => {
            let r = p.clone();
            r.z = 0;
            r.setLength(1.2 * 0.70);
            r.sub(p).normalize();

            return r;
        }),

    createGeoPenguinScene("Dice", "dice",
        dice()
        , 8, true, 1.0, 0.8, true, 32, 0.9995, 0.008, p => {
            let r = p.clone();
            r.x = - 8 * r.x ** 7;
            r.y = - 8 * r.y ** 7;
            r.z = - 8 * r.z ** 7;
            r.normalize();

            return r;
        }),

    createGeoPenguinScene("Tetra", "tetra", tetraFunc, 10, true, 0.3, 1.0, false, 10, 0.999, 0),

    createGeoPenguinScene("cos-ball", "ballcos", (x, y, z) => x * x + y * y + z * z - ((Math.cos(16 * x) + Math.cos(16 * y) + Math.cos(16 * z)) / 8.0 + 0.8), 10, true, 0.8, 0.65, true, 10, 0.999, 0.008),

    createGeoPenguinScene("sin-cos", "sincos",
        ORFuncs(
            (x, y, z) => x * x + y * y + z * z - ((Math.cos(9 * x) + Math.cos(9 * y) + Math.cos(9 * z)) / 9.0 + 0.8),
            (x, y, z) => x * x + y * y + z * z - ((Math.sin(9 * x) + Math.sin(9 * y) + Math.sin(9 * z)) / 9.0 + 0.8),
            0.075
        ), 10, true, 0.8, 0.8, true, 10, 0.999, 0.008),

    createGeoPenguinScene("Heart", "heart", (x, y, z) => (2 * x ** 2 + y ** 2 + z ** 2 - 1) ** 3 - (0.1 * x ** 2 + y ** 2) * z ** 3, 10, true, 0.8, 0.8, true, 10, 0.999, 0),

    createGeoPenguinScene("Logo", "logo",
        ANDManyFuncs([
            (x, y, z) => Math.abs(x) - 1,
            (x, y, z) => Math.abs(y) - 1,
            (x, y, z) => Math.abs(z) - 1,
            (x, y, z) => x ** 2 + y ** 2 + z ** 2 - 1.25 ** 2,
            (x, y, z) => 0.49 ** 2 - x ** 2 - y ** 2,
            (x, y, z) => 0.49 ** 2 - x ** 2 - z ** 2,
            (x, y, z) => 0.49 ** 2 - z ** 2 - y ** 2
        ], 0.05),
        10, true, 0.8, 0.8, true, 10, 0.999, 0),


];