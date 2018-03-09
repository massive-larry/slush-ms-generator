const gulp = require('gulp');
const install = require('gulp-install');
const conflict = require('gulp-conflict');
const template = require('gulp-template');
const inquirer = require('inquirer');

gulp.task('default', (done) => {
    inquirer.prompt([
        { type: 'input', name: 'projectName', message: 'enter project name (service-)', default: gulp.args.join(' ')},
        { type: 'confirm', name: 'areYouSure', message: 'are you done?' }
    ], (answers) => {
        if(!answers.areYouSure) {
            return done()
        }
        gulp.src(__dirname + '/templates/**')
            .pipe(template(answers))
            .pipe(conflict('./'))
            .pipe(gulp.dest('./'))
            .pipe(install())
            .on('end', () => {
                done();
            })
            .resume()
    })
});