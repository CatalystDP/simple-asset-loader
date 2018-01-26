'use strict';

const webpack = require('webpack'),
    path = require('path');
const ROOTPATH = process.cwd();
let config = {
    DISTPATH: path.join(ROOTPATH, 'dist'),
    entry: {
        app: path.join(ROOTPATH, 'js/index.js')
    }
};

let _config = {
    entry: config.entry,
    context: path.join(ROOTPATH, 'js'),
    output: {
        path: config.DISTPATH,
        publicPath: '../dist/',
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    // watch:true,
    plugins: [
    ],
    module: {
        rules: [
            {
            }
        ]
    },
    loader: {
        simpleAssetConfig: {
        }
    }
};
// _config.devtool = 'inline-source-map';
module.exports = _config;
