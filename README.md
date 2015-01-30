# pruno-swig

A swig mix for pruno that includes gulp-data.

## Usage

```js
"use strict";

var pruno = require('pruno');

pruno.plugins(function(mix) {
  mix
    .configure({ dir: __dirname + '/config' })
    .swig({
      data: '::src/templates/data',
      entry: '::src/templates/**/*.html',
      dist: '::dist',
      search: [
        '::src/templates/**/*.html',
        '::src/templates/data/**/*'
      ],
      ignorePrefix: '_'
    });
});
```
