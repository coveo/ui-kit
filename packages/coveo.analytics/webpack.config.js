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
    },
    devServer: {
        contentBase: [path.join(__dirname, "public"), path.join(__dirname, "dist")]
    }
}
