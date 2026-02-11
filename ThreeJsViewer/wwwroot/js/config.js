export const sceneConfigurations = [
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
                    m.position.y = - 0.5 * (1.0 + Math.sin(1 * t));
                    m.rotation.y = Math.PI * (1.0 + Math.sin(1 * t));
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
                    m.rotation.z = -(Math.PI / 2) * v / 1.4;
                }
            }
        ]
    },

    {
        name: "Open heart 1",
        setup: (camera) => {
            camera.position.set(0, 3, 1);
        },
        models: [
            {
                path: 'assets/heart/Open heart in1.ply',
                color: 0xff69b4,
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
                color: 0xff69b4,
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
                color: 0xff69b4/*,
                animate: (m, t) => {
                    let v = 2 * triangle01(t, 10);
                    v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                    v = sinSmooth(v, 0, 1.6);

                    m.position.z = -v;

                    v = Math.max(v - 0.2, 0);
                    m.rotation.x = -(Math.PI / 2) * v / 1.4;
                }*/
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

    //{
    //    name: "Shrek layers colors",
    //    models: [
    //        {
    //            path: 'assets/ShrekSDFIn.ply',
    //            animate: (m, t) => {
    //                let v = anim1(t);
    //                m.position.y = -v;
    //                m.rotation.z = v;
    //            },
    //            setupMaterial: m => {
    //                m.color = 0xffffff;
    //                m.vertexColors = true;
    //            }
    //        },
    //        {
    //            path: 'assets/ShrekSDFOut.ply',
    //            animate: (m, t) => {
    //                let v = anim1(t);
    //                m.position.y = v;
    //                m.rotation.z = -v;
    //            },
    //            setupMaterial: m => {
    //                m.color = 0xffffff;
    //                m.vertexColors = true;
    //            }
    //        }
    //    ]
    //},


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
        name: "Star ball",
        models: [
            {
                path: 'assets/StarBall1.ply',
                color: 0xffd700,
                setupMaterial: m => {
                    m.metalness = 0.7;
                    m.roughness = 0.3;
                    m.emissive = 0xffa500;
                    m.emissiveIntensity = 0.1;
                }
            },
            {
                path: 'assets/StarBall.ply',
                color: 0xffd700,
                setupMaterial: m => {
                    m.metalness = 0.7;
                    m.roughness = 0.3;
                    m.emissive = 0xffa500;
                    m.emissiveIntensity = 0.1;
                },
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


];

function anim1(t) {
    let v = Math.min(Math.max(2 * Math.sin(t / 2), 0), 1.25);
    v *= v;
    return v;
}

function triangle01(t, period = 1) {
    let x = t / period;
    x = x - Math.floor(x);     // fractional part
    return x < 0.5 ? 2 * x : 2 * (1 - x);
}

function sinSmooth(y, y0, y1) {
    y = -Math.PI / 2 + Math.PI * (y - y0) / (y1 - y0);

    return y0 + (y1 - y0) * (Math.sin(y) + 1) / 2;
}
