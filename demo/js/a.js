var assetRoute = require('simple-asset-loader?assetMap=true&rule=test1!./assetsMap/assetA.json');
['asyncA', 'asyncB', 'asyncC'].forEach(function (chunk) {
    assetRoute(chunk, function (mod) {
        mod();
    });
});