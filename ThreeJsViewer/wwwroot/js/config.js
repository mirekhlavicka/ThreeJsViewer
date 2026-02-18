import * as THREE from 'three';

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
    },

    {
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
                prepareMesh: m => {
                    m.rotation.x = Math.PI / 2;
                    m.scale.set(0.19, 0.19, 0.19);
                },
                color: 0xB87A1B,
                animate: (m, t) => {
                    let v = 1.8 * triangle01(t, 10);
                    v = -0.4 + Math.min(Math.max(v, 0.4), 1.6);
                    v = sinSmooth(v, 0, 1.2);

                    m.rotation.y = (4.2* Math.PI ) * v / 1.2;                    

                    m.position.x = v / 2;
                    m.position.y = -1.8 * v - 0.1;
                    m.position.z = 0.08 + 0.8 * v;
                }
            }

        ]
    }
];

function triangle01(t, period = 1) {
    let x = t / period;
    x = x - Math.floor(x);     // fractional part
    return x < 0.5 ? 2 * x : 2 * (1 - x);
}

function sinSmooth(y, y0, y1) {
    y = -Math.PI / 2 + Math.PI * (y - y0) / (y1 - y0);

    return y0 + (y1 - y0) * (Math.sin(y) + 1) / 2;
}

function goldMaterial(m) {
    m.metalness = 0.7;
    m.roughness = 0.3;
    m.emissive = 0xffa500;
    m.emissiveIntensity = 0.1;
}

function globeColors(geometry)  {
    const pos = geometry.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    // 1. Find the Min/Max radius to establish a scale
    let minR = Infinity;
    let maxR = -Infinity;
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = Math.sqrt(pos.getX(i) ** 2 + pos.getY(i) ** 2 + pos.getZ(i) ** 2);
        radii[i] = r;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
    }

    // 2. Define our "Palette" points
    const colorWaterDeep = new THREE.Color(0x050a30); // Dark Blue
    const colorWaterShallow = new THREE.Color(0x005b96); // Light Blue
    const colorSand = new THREE.Color(0xc2b280); // Sand
    const colorGrass = new THREE.Color(0x228b22); // Forest Green
    const colorMountain = new THREE.Color(0x4b3621); // Dark Brown
    const colorSnow = new THREE.Color(0xffffff); // White

    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
        // Normalize radius between 0 and 1
        const h = (radii[i] - minR) / (maxR - minR);

        if (h < 0.45) {
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