
var gulp = require('gulp');
var sass = require('gulp-sass');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var nodemon = require('gulp-nodemon');

var spawn = require('child_process').spawn;

var jsxDir = './client/jsx';

var port = process.env.PORT || 7070;

// Define paths for all source files here
var paths = {
    client: ['./client/jsx/*.jsx'],
    sass: ['./scss/*.*'],

    server: './server.js',
    serverIgnore: ['./gulpfile.js', './scss', './pug', './public', './build',
        './client'],

    tags: ['./client/**/*', './server/**/*', './scss/**/*'],

    test: ['./client/plots/*.js', './test/xyplot.js']

};

gulp.task('build-js', function() {
    return browserify({entries: jsxDir + '/app.jsx',
        extensions: ['.jsx'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundle.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('build-test', function() {
    return browserify({entries:
        ['test/xyplot.js'],
        extensions: ['.js'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundleTests.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('build-sass', function() {
	return gulp.src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build'));

});

var buildTasks = ['build-js', 'build-sass'];

gulp.task('build', buildTasks, function() {
    console.log('Building the application.');
});

/* Task for starting/restarting server on any changes.*/
gulp.task('serve', function(cb) {
    var called = false;
    nodemon({
        script: paths.server,
        ext: '.js',
        ignore: paths.serverIgnore,
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            DEBUG: process.env.DEBUG || 0,
            PORT: port
        }
    })
    .on('start', function() {
        if (!called) {
            console.log('Server started on port ' + port);
            called = true;
            cb();
        }
    })
    .on('restart', function(files) {
        if (files) {
            console.log('Nodemon will restart due to changes in: ', files);
        }
    });
});

// Bit unusual task. Builds ctags-file for easier src navigation in Vim
gulp.task('tags', function() {
    console.log('Building ctags for the project.');
    spawn('ctags', ['-R', 'client/', 'server/', 'scss/']);
});

var watchDependents = [
  'build-js',
  'tags',
  'build-sass',
  'serve'
];

gulp.task('watch', watchDependents, function() {
    gulp.watch(paths.client, ['build-js']);
    gulp.watch(paths.server, ['serve']);
    gulp.watch(paths.sass, ['build-sass']);
    gulp.watch(paths.tags, ['tags']);
});

gulp.task('watch-test', ['build-test'], function() {
    gulp.watch(paths.test, ['build-test']);
});

gulp.task('default', ['watch']);

