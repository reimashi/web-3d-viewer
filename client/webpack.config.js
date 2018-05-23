const path = require('path');
const webpack = require("webpack");
const html_webpack = require('html-webpack-plugin')

const CODE_FOLDER = path.resolve(__dirname, './src/');
const DIST_FOLDER = path.resolve(__dirname, './dist/');

module.exports = {
    mode: 'development',
    entry: {
        app: path.join(CODE_FOLDER, "./app/main.js"),
        style: path.join(CODE_FOLDER, "./styles/main.scss"),
        view: path.join(CODE_FOLDER, "./views/main.html")
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader",
                    options: {
                        includePaths: ["styles"]
                    }
                }]
        },
        {
            test: /\.html$/,
            use: [{ loader: "html-loader" }]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            '$': "jquery",
            'jQuery': "jquery"
        }),
        new html_webpack({
            template: path.join(CODE_FOLDER, "index.html")
        })
    ],
    output: {
        filename: '[name].js',
        path: DIST_FOLDER
    }
};