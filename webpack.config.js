const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {

    // 1. Change mode to 'production'
    // This automatically enables default minification (TerserPlugin).
    // mode: "production",
    mode: "development",

    // 2. Remove or set devtool to false
    // 'false' or omitting the line prevents source maps, which link compiled code back to source.
    // devtool: false,
    devtool: "inline-source-map",

    entry: {
        main: "./src/index.ts",
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        // filename: "[name]-bundle.js"
        filename: "bundle.min.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    // Add the plugins section
    plugins: [
        /*
        new JavaScriptObfuscator(
            {
                // Obfuscator options for high illegibility:
                rotateStringArray: true,
                compact: true,
                controlFlowFlattening: true, // Highest level of obfuscation
                deadCodeInjection: true,
                debugProtection: true,
                // The 'stringArrayThreshold' controls how many strings are moved to the array.
                stringArrayThreshold: 1,
                // Set to 'low' for obfuscation that's hard to debug but still runs fast.
                // Use 'high' for maximum illegibility (can increase file size).
                target: 'browser',
            },
            ['terrain-randomizer.js'] // Apply only to your output file
        )*/
    ]
};