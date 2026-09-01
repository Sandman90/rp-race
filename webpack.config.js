const path = require('path');
// const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    mode: "production",
    // mode: "development",

    // 'false' or omitting the line prevents source maps, which link compiled code back to source.
    devtool: false,
    // devtool: "inline-source-map",

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
    plugins: []
};