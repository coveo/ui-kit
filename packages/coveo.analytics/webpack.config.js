const webpack = require("webpack");

module.exports = {
    entry: "./src/browser.ts",
    mode: "production",
    output: {
        path: __dirname + "dist/",
        filename: "coveoua.js"
    },
    resolve: {
        extensions: ['.ts', '.tsx']
    },
    devtool: "source-map",
    module: {
        rules: [{
            enforce: 'pre',
            test: /\.ts$/,
            use: {
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    failOnHint: true,
                    formattersDirectory: "node_modules/tslint-loader/formatters/",
                    configuration: require(__dirname + '/tslint.json')
                }
            }
        }, {
            test: /\.ts$/,
            loader: 'ts-loader',
        }]
    }
}
