"use strict";

var shelljs = require('shelljs');
var data = require('gulp-data');
var swig = require('gulp-swig');
var fs = require('fs');
var path = require('path');
var through = require('through2');

function SwigTask(params) {
  this.params = (params || {});
}

SwigTask.displayName = 'SwigTask';

SwigTask.getDefaults = function() {
  return {
    dataSrc: '::src/templates/data',
    entry: '::src/templates/**/*.html',
    dist: '::dist',
    search: [
      '::src/templates/**/*.html',
      '::src/templates/data/**/*',
      '::src/**/webpack-stats.json'
    ],
    ignorePrefix: '_'
  };
};

SwigTask.prototype.enqueue = function(gulp, params) {
  params || (params = {});
  var compiler = 'swig';
  var topLevel = shelljs.pwd();
  var opts = distillOptions(SwigTask, params);
  var IGNORE_SEARCH = new RegExp('^'+ params.ignorePrefix);

  gulp.src(params.entry)
    .pipe(through.obj(function(file, enc, cb) {
      var fileName = path.basename(file.path);
      var isSys = IGNORE_SEARCH.test(fileName);
      cb(null, isSys ? null : file);
    }))
    .pipe(data(function(file, cb) {
      var data;
      var dataFile = path.join(
        topLevel,
        params.dataSrc,
        path.basename(file.path).replace(/\.html$/, '')
      );

      if (fs.existsSync(dataFile + '.js')) {
        data = require(dataFile + '.js');
      }
      else if (fs.existsSync(dataFile + '.json')) {
        data = require(dataFile + '.json');
      }
      if (typeof data === 'function') {
        data(cb);
      }
      else {
        cb(null, data);
      }
    }))
    .pipe(swig(opts))
    .on('error', function(err) {
      console.error(err);
    })
    .pipe(gulp.dest(params.dist));
};

SwigTask.prototype.generateWatcher = function(gulp, params) {
  return true;
};

function distillOptions(Task, params) {
  var defaults = Object.keys(Task.getDefaults())
    .concat(['taskName']);

  return Object.keys(params)
    .filter(function (param) {
      return defaults.indexOf(param) === -1;
    })
    .reduce(function (memo, param) {
      memo[param] = params[param];
      delete params[param];
      return memo;
    }, {});
}

module.exports = SwigTask;
