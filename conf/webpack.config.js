const config = {
    entry: {
        client: "./src/client.js",
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
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
    ]
};

module.exports = config;
