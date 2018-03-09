const through = require('through2');

const packageConfigTransformer = function (options) {
    return through.obj(function (file, enc, cb) {
        cb();
    })
};

module.exports = packageConfigTransformer;