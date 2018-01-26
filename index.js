const loaderUtil = require('loader-utils');
const LOADER_NAME='simple-asset-loader';
module.exports = function (content, map, meta) {
    console.log(this.query);
    console.log('context ', this.context);
    let query;
    try {
        query = loaderUtil.parseQuery(this.query);
    } catch (e) { }
    if (!query) query = {};
    let loaderConf = this.simpleAssetConfig || {};//额外的loader配置
    if (!!query.assetMap) {
        return transformToSwitchCase(content, query);
    }
    if (query.rule && typeof loaderConf[query.rule] === 'function') {
        //使用自定义rule，要包上一层function
        return 'module.exports=function(cb,errCb){'+loaderConf[query.rule](this, query)+';}';
    }
    if (!!query.chunkName) {
        query.async = true;
    }
    if (!query.async) {
        return `require(${JSON.stringify(this.resource)})`;
    } else {
        let chunkName = query.chunkName || '';
        return `module.exports = function(cb,errCb){
            require.ensure([],function(require){
                var m = require(${JSON.stringify(this.resource)});
                typeof cb === ${JSON.stringify('function')} && cb(m,${JSON.stringify(chunkName)});
            },function(err){
                typeof errCb === ${JSON.stringify('function')} && errCb(err,${JSON.stringify(chunkName)})
            },${JSON.stringify(chunkName)});
        }`;
    }
    return '';
}
/**
 * @description 把一个资源表转化成switch case，必须是一个json文件 
 * @param {*} assetMap .e.g 
 * {
 *    "chunkA":"path-to-fileA",
 *    "chunkB":"path-to-fileB"
 * } 
 */
function transformToSwitchCase(assetMap, query = {}) {
    let map;
    try {
        map = JSON.parse(assetMap)
    } catch (e) { }
    if (!map) return '';
    let cases = [];
    for (let key in map) {
        let request =`${LOADER_NAME}?`;
        let params=[];
        params.push('chunkName='+key);
        if(query.rule){
            params.push(`rule=${query.rule}`);
        }
        request+=params.join('&');
        request+='!'
        cases.push(`    
                case ${JSON.stringify(key)}:
                require(${JSON.stringify(request+map[key])})(
                    function(mod){
                        typeof cb===${JSON.stringify('function')} && cb(mod,${JSON.stringify(key)});
                    },
                    function(err){
                        typeof errCb===${JSON.stringify('function')} && errCb(err,${JSON.stringify(key)});
                    }
                );
                break;`);
    }
    return `
        module.exports=function(name,cb,errCb){
            switch(name){
                ${cases.join('\n')}
            }
        }
    `;
}