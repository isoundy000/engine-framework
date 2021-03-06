var gulp = require('gulp');
var fb = require('gulp-fb');

var TimeOutInSeconds = 5;

gulp.task('unit-runner', function() {
    var js = paths.test.src;
    var dest = paths.test.src.split('*')[0];
    return gulp.src(js, { read: false, base: './' })
        .pipe(fb.toFileList())
        .pipe(fb.generateRunner(paths.test.runner,
            dest,
            'Engine Framework Test Suite',
            paths.test.lib_min,
            paths.test.lib_dev,
            paths.src))
        .pipe(gulp.dest(dest))
        ;
});

gulp.task('test', ['build', 'unit-runner'], function() {
    var qunit;
    try {
        qunit = require('gulp-qunit');
    }
    catch (e) {
        console.error('Please run "npm install gulp-qunit" before running "gulp test".');
        throw e;
    }
    return gulp.src('test/unit/runner.html', { read: false })
        .pipe(qunit({ timeout: TimeOutInSeconds }));
});
