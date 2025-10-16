module.exports = {
    presets: [
        [
            '@babel/preset-react',
            {
                runtime: 'automatic',
                importSource: 'react',
            },
        ],
        '@babel/preset-typescript',
        '@babel/preset-env',
    ],
};
