const loaderUtil = require('loader-utils');
const LOADER_NAME = 'simple-asset-loader';
const asyncWrap = {
    START: 'module.exports=function(cb,errCb){',
    END: '}'
};
/**
 * 
 * @param {*} opt 
 *      @param opt.resource 引用的资源地址
 *      @param opt.chunkName 引用的模块名称 
 */
function defaultAsyncTpl(opt = {}) {
    return `
        require.ensure([],function(require){
            var m = require(${JSON.stringify(opt.resource)});
            typeof cb === ${JSON.stringify('function')} && cb(m,${JSON.stringify(opt.chunkName)});
        },function(err){
            typeof errCb === ${JSON.stringify('function')} && errCb(err,${JSON.stringify(opt.chunkName)})
        },${JSON.stringify(opt.chunkName)});
        `;
};
/**
 * 
 * @param {*} opt 
 *      @param opt.resource 引用的资源地址 
 */
function defaultSyncTpl(opt = {}) {
    return `require(${JSON.stringify(opt.resource)})`;
}
let loader = module.exports = function (content, map, meta) {
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
        return asyncWrap.START + loaderConf[query.rule](this, query) + asyncWrap.END;
    }
    if (!!query.chunkName) {
        query.async = true;
    }
    if (!query.async) {
        return defaultSyncTpl({
            resource: this.resource
        });
    } else {
        let chunkName = query.chunkName || '';
        return asyncWrap.START + defaultAsyncTpl({
            resource: this.resource,
            chunkName
        }) + asyncWrap.END;
    }
    return '';
}
Object.assign(loader, {
    defaultAsyncTpl,
    defaultSyncTpl
});
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
        let request = `${LOADER_NAME}?`;
        let params = [];
        let val = map[key];
        let rule = query.rule;
        let fileName, async = true;
        if (typeof val !== 'string') {
            try {
                fileName = val.name;
                async = val.async !== false;
                if(val.hasOwnProperty('rule')){
                    rule = val.rule;
                }
            } catch (_) { }
        } else {
            fileName = val;
        }
        if (!fileName) continue;
        params.push('chunkName=' + key);
        if (rule) {
            params.push(`rule=${rule}`);
        }
        request += params.join('&');
        request += '!';
        if (!async) {
            //支持资源表的同步require
            cases.push(`
                case ${JSON.stringify(key)}: 
                var mod = require(${JSON.stringify(fileName)});             
                typeof cb === ${JSON.stringify('function')} && cb(mod);
                break;
            `);
        } else {
            cases.push(`    
                    case ${JSON.stringify(key)}:
                    require(${JSON.stringify(request + fileName)})(
                        function(mod){
                            typeof cb===${JSON.stringify('function')} && cb(mod,${JSON.stringify(key)});
                        },
                        function(err){
                            typeof errCb===${JSON.stringify('function')} && errCb(err,${JSON.stringify(key)});
                        }
                    );
                    break;`);
        }
    }
    return `
        module.exports=function(name,cb,errCb){
            switch(name){
                ${cases.join('\n')}
            }
        }
    `;
}