const through = require('through2');

const packageConfigTransformer = function (options) {
    return through.obj(function (file, enc, cb) {
        console.log('answers from input', options);
        console.log('file recieved', file);
        cb();
    });
};

module.exports = packageConfigTransformer;