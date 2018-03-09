const gulp = require('gulp');
const install = require('gulp-install');
const conflict = require('gulp-conflict');
const template = require('gulp-template');
const inquirer = require('inquirer');

const path = require('path');

const packageConfigTransformer = require('./transformers/project');

const paths = {
    cwd: path.resolve(__dirname, process.cwd, './')
};

gulp.task('default', (done) => {
    inquirer.prompt([
        { type: 'input', name: 'projectName', message: 'enter project name (service-)', default: gulp.args.join(' ')},
        { type: 'list', name: 'testType', choices:['unit', 'component', 'integration'], message: 'What kind(s) of tests will you run' },
        { type: 'confirm', name: 'areYouSure', message: 'are you done?' },
    ], (answers) => {
        if(!answers.areYouSure) {
            return done()
        }
        gulp.src(__dirname + '/templates/**')
            .pipe(template(answers))
            .pipe(packageConfigTransformer(answers))
            .pipe(conflict('./'))
            .pipe(gulp.dest(paths.cwd))
            .pipe(install())
            .on('end', () => {
                done();
            })
            .resume()
    })
});