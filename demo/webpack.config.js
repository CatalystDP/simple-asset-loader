'use strict';

const webpack = require('webpack'),
    path = require('path');
const ROOTPATH = process.cwd();
const simpleAssetLoader = require('../');
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
            test1: (context, options) => { 
                let loadFun = simpleAssetLoader.defaultAsyncTpl({
                    resource:context.resource,
                    chunkName:options.chunkName||''
                })
                return `
                    (function test1(){
                        ${loadFun}
                    })();
                `; 
            },
            test2:(context,options) =>{
                let loadFun = simpleAssetLoader.defaultAsyncTpl({
                    resource:context.resource,
                    chunkName:options.chunkName||''
                })
                return `
                    (function test2(){
                        ${loadFun}
                    })();
                `; 
            }
        }
    }
};
// _config.devtool = 'inline-source-map';
module.exports = _config;
