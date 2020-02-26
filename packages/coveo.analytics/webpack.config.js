const path = require('path');

module.exports = {
    entry: {
        coveoua: "./src/coveoua/browser.ts",
        library: "./src/coveoua/library.ts"
    },
    mode: "production",
    output: {
        path: path.resolve(__dirname, "./dist/"),
        filename: "[name].js"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
        ],
    },
    devServer: {
        contentBase: [path.join(__dirname, "public"), path.join(__dirname, "dist")]
    }
}
