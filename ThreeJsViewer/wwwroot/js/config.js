export const sceneConfigurations = [
    {
        name: "Pets Scene",
        //autoRotateSpeed: 0.05,
        models: [
            {
                path: 'assets/Labrador and cat - heart.ply',
                color: 0xff69b4, // Hot Pink
                animate: function (m, t) {
                    m.position.y = - 0.5 * (1.0 + Math.sin(1 * t))
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
        name: "Pear Scene",
        autoRotateSpeed: 0.03,
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
                animate: function (m, t) {
                    m.position.z = 0.5 * (1.0 + Math.sin(0.5 * t));
                }
            }
        ]
    }

];