export const sceneConfigurations = [
    {
        name: "Dog & cat Valentine's day",
        //autoRotateSpeed: 0.05,
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
                path: 'assets/Labrador and cat.ply',
                wire: false
                //color: 0x00bfff, // Deep Sky Blue
            }
        ]
    },

    {
        name: "Shrek layers",
        gridZ : -0.65,
        models: [
            {
                path: 'assets/ShrekSDFIn.ply',
                color: 0xB0C400,
                animate: (m, t) => {
                    //m.position.y = - 0.5 * (1.0 + Math.sin(1 * t));
                    //m.rotation.z = 0.5 * (1.0 + Math.sin(1 * t));

                    m.position.y = -Math.max(Math.sin(t), 0);
                    m.rotation.z = Math.max(Math.sin(t), 0);

                }
            },
            {
                path: 'assets/ShrekSDFOut.ply',
                wire: false,
                color: 0xB0C400,
                animate: (m, t) => {
                    //m.position.y =  0.5 * (1.0 + Math.sin(1 * t));
                    //m.rotation.z = -0.5 * (1.0 + Math.sin(1 * t));
                    m.position.y = Math.max(Math.sin(t), 0);
                    m.rotation.z = -Math.max(Math.sin(t), 0);

                }
            }
        ]
    },



    {
        name: "Pear container",
        //autoRotateSpeed: 0.03,
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
                    m.position.z = 0.5 * (1.0 + Math.sin(0.5 * t));
                    m.rotation.x = 0.5 * (1.0 + Math.sin(0.5 * t));
                }
            }
        ]
    }

];