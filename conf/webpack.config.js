const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");

const config = {
    entry: {
        client: path.join(__dirname, "..", "src/client/client.js"),
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: {
                    loader: "file-loader"
                }
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.join(__dirname, "..", "src/client/index.html"),
            filename: "./index.html"
        })
    ]
};

module.exports = config;
