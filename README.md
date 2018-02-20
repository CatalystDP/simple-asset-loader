

### Simple-asset-loader

#### 用于简化异步加载编写，通过

```js
require('simple-asset-loader?async=true![.js|.json]')(cb,errCb);
```

#### 可以自动生成如下代码

```Js
module.exports=function(cb,errCb){
  	require.ensure([],function(require){
      	var m=require('path-to-js');
        cb(m);
    },function(err){
      errCb(err);
    });
}
```

**当没有给simple-asset-loader传入任何参数时，等价于直接`require`一个模块，`require`返回的并不是`module.exports=function(cb,errCb){}这样的函数，而是直接返回被引用模块导出的对象。`**

### Params

1. `chunkName` 会让当前资源变为异步加载并会在`require.ensure` 最后一个参数带上`chunkName`使这个异步加载的chunk变成一个命名chunk。

2. `async=true`会让当前资源加载变为异步加载。

3. `rule=[rule]`自定义规则，这个参数需要配合配置一起使用：

   ```javascript
   {
     ...some webpack config
     loader:{
       simpleAssetConfig{
         'your-rule':function(context,options){
           	// context 是代表当前loader的this对象
           	// options 表示传到loader上的url参数
           	// 当前规则需要用字符串拼接上 cb 和 errCb(可选) 这个用于加载完成的回调和失败回调
           	 return `require.ensure([],function(require){
   				var m = require(${JSON.stringify(context.resource)})
   				typeof cb === ${JSON.stringify('function')} && cb(m);
   			  },function(err){
   				typeof errCb === ${JSON.stringify('function')} && errCb(err);
   			  },${JSON.stringify(query.chunkName)});`
         }
       }
     }
   }
   ```

   - 调用loader示例

     ```
     require('simple-asset-loader?rule=your-rule')(mod=>{
       //
     },err=>{
       //加载失败
     });
     ```

     ​

   4.`assetMap=true` 此时需要引用的资源需要是一个`json`文件，格式为：

   ```
   {
       "asyncA":"../async/asyncA.js",
       "asyncB":"../async/asyncB.js",
       "asyncC":{
           "name":"../async/asyncC.js",
           "async":false
       }
   }
   ```

   调用`var assetRoute=require('simple-asset-loader?assetMap=true!assetMap.json');`回返回一个路由函数，通过调用`assetRoute(chunkName,cb,errCb)`可以在`cb`回调内拿到对应的加载到的chunk 返回的对象，与异步加载类似。默认情况下assetMap内的模块都是使用异步加载的，如果map的值是一个对象，必须要要提供`name`作为模块名，`async`是可选的，当`async=false`意味着使用普通的`require`加载模块，`require` 返回的对象依然是通过`cb`回调返回。