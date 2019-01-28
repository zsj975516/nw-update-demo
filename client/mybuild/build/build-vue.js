require('./check-versions')();

const rimraf = require('rimraf');
const webpack = require('webpack');
const path = require('path');
const config = require('../config/index.js');
// const webpackConfig = require('./webpack_build_config');
const webpackConfig = require('../config/webpack.prod.conf');

module.exports.build = function () {
  return new Promise(function (resolve, reject) {
    rimraf(path.resolve(config.assetsRoot, 'static'), err => {
      if (err) throw err;
      webpack(webpackConfig, function (err, stats) {
        if (err) throw err;
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n');
        resolve();
      })
    });
  })
};
