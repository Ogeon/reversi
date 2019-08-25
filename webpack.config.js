const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const mode = 'development';

const webpageConfig = {
    entry: './web/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        publicPath: '/reversi/'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                enforce: 'pre',
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-modules-typescript-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                            mode: 'local',
                            localIdentName: '[name]_[local]_[hash:base64:5]'
                            }
                        }
                    },
                    'sass-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
                include: /node_modules/
            },
            {
              test: /\.(svg|eot|ttf|woff2?)$/,
              loader: "file-loader"
            }
        ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'web', 'index.html'),
            minify: true,
        }),
        new MiniCssExtractPlugin({
          filename: 'styles.css',
        }),
    ],
    mode
}

const bothello1Config = {
    entry: './web/bothello1.worker.ts',
    target: 'webworker',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bothello1.worker.js',
        publicPath: '/reversi/'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
        ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "bothello1"),
            mode: 'production'
        }),
    ],
    mode
};

module.exports = [webpageConfig, bothello1Config];
