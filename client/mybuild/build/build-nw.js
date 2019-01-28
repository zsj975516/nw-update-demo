const path = require('path');
const fs = require('fs');
const config = require('../config/index');

// `./dist/package.json`的路径
const manifestPath = path.resolve(config.assetsRoot, 'package.json');

// `./dist/buildConfig.js`的内容
let manifest = {};
const util = require('util');
// 遍历合并字段
config.manifest.forEach(function (v, i) {
  if (util.isString(v)) manifest[v] = config.proPackage[v];
  else if (util.isObject(v)) manifest = util._extend(manifest, v);

});

/**
 * 开始构建nw
 */
module.exports.build = function () {
  return new Promise(function (resolve, reject) {

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    if (!config.nwBuilder) throw new Error('请检查配置');
    const NwBuilder = require('nw-builder');
    let nw = new NwBuilder(config.nwBuilder);
    nw.on('log', console.log);
    nw.build(function (err, data) {
      if (err) throw err;
      resolve();
    });
  })
};
