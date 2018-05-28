const path = require('path');
const webpack = require("webpack");
const html_webpack = require('html-webpack-plugin');

const MODE = 'development'; // 'production';

const CODE_FOLDER = path.resolve(__dirname, './src/');
const DIST_FOLDER = path.resolve(__dirname, './dist/');

module.exports = {
    mode: MODE,
    entry: {
        app: path.join(CODE_FOLDER, "./app/main.js"),
        style: path.join(CODE_FOLDER, "./styles/main.scss")
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
            use: [{ loader: "html-loader", options: { interpolate: true, minimize: MODE !== 'development', removeComments: MODE !== 'development' } }]
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