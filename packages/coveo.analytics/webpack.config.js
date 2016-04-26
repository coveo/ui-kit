var webpack = require("webpack");

module.exports = {
    entry: "./src/browser.ts",
    output: {
        path: "./dist/",
        filename: "coveoua.js"
    },
        devtool: 'source-map',
        resolve: {
        extensions: ['', '.ts'],
        root: __dirname
    },
    module: {
        loaders: [{test: /\.ts$/, loader: 'ts-loader'}],
        preLoaders: [{test: /\.ts$/, loader: 'tslint'}]
    },
    plugins:[
        new webpack.ProvidePlugin({
            'Promise': 'es6-promise',
            'fetch': 'exports?self.fetch!whatwg-fetch'
        }),
        new webpack.optimize.UglifyJsPlugin()
    ],
    ts: {
        compilerOptions: {
            declaration: false,
        }
    },
    tslint: {
        emitErrors: true,
        failOnHint: true,
        formattersDirectory: "node_modules/tslint-loader/formatters/",
        configuration: require(__dirname + '/tslint.json')
    }
}
