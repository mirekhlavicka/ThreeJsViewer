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
                    m.rotation.y = 3 * (1.0 + Math.sin(1 * t));
                }
            },
            {
                path: 'assets/Labrador and cat.ply'
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
                    let v = Math.min(Math.max(2 * Math.sin(t/2), 0), 1.25);
                    v *= v ;
                    m.position.y = -v;
                    m.rotation.z = v;
                }
            },
            {
                path: 'assets/ShrekSDFOut.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    let v = Math.min(Math.max(2 * Math.sin(t / 2), 0), 1.25);
                    v *= v;
                    m.position.y = v;
                    m.rotation.z = -v;
                }
            }
        ]
    },

    {
        name: "Shrek layers colors",
        models: [
            {
                path: 'assets/ShrekSDFIn.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    let v = Math.min(Math.max(2 * Math.sin(t / 2), 0), 1.25);
                    v *= v;
                    m.position.y = -v;
                    m.rotation.z = v;
                },
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                }
            },
            {
                path: 'assets/ShrekSDFOut.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    let v = Math.min(Math.max(2 * Math.sin(t / 2), 0), 1.25);
                    v *= v;
                    m.position.y = v;
                    m.rotation.z = -v;
                },
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                }
            }
        ]
    },


    {
        name: "Pear container",
        models: [
            {
                path: 'assets/Pear - bottom.ply',
                wire: true,
                color: 0xd1e231
            },
            {
                path: 'assets/Pear - top.ply',
                wire: true,
                color: 0xd1e231,
                animate: (m, t) => {
                    let v = 0.5 * (1.0 + Math.sin(0.5 * t));
                    m.position.z = v;
                    m.rotation.x = v;
                }
            }
        ]
    }

];