require('simple-asset-loader?chunkName=chunkA!./a')((mod)=>{
},(err)=>{
    console.log('load chunk error ',err);
});
// require('simple-asset-loader?assetMap=true!./assetsMap/assetA.json');
