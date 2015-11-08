var gulp  				= require('gulp'),
    gutil 				= require('gulp-util'),
    del 					= require('del'),
		serve      		= require('gulp-serve'),
    uglify     		= require('gulp-uglify'),
    jshint     		= require('gulp-jshint'),
    sass       		= require('gulp-sass'),
    concat     		= require('gulp-concat'),
		htmlmin    		= require('gulp-htmlmin'),
    sourcemaps 		= require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache'),
		addStream 		= require('add-stream'),

    input  = {
      'sass': 'src/*.scss',
      'javascript': 'src/*.js',
      'html': 'src/*.tpl.html'
    },

    output = {
      'stylesheets': 'dist',
      'javascript': 'dist'
    };

/* run the watch task when gulp is called without arguments */
gulp.task('default', ['build']);

gulp.task('serve', ['build', 'watch', 'serve-assets']);

/* run javascript through jshint */
gulp.task('jshint', function() {
  return gulp.src(input.javascript)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

/* compile scss files */
gulp.task('build-css', function() {
  return gulp.src(input.sass)
    .pipe(sourcemaps.init())
      .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.stylesheets));
});

/* build angular template cache from html */
var prepareTemplates = function() {
  return gulp.src('src/*.tpl.html')
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
    .pipe(templateCache({
    	module: 'angular-translate-templates',
    	standalone: true
    }));
};

/* concat javascript files and minify */
gulp.task('build-js', function() {
  return gulp.src(input.javascript)
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('angular-translate-editor.js'))
    .pipe(gulp.dest(output.javascript));
});

/* concat javascript files and minify */
gulp.task('compile-js', function() {
  return gulp.src(input.javascript)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('angular-translate-editor.min.js'))
    .pipe(gulp.dest(output.javascript));
});

gulp.task('clean', function() {
 	return del(['dist/*.js']);
});

gulp.task('serve-assets', serve(['example', 'dist']));

gulp.task('build', ['clean', 'build-js', 'compile-js']);

/* Watch these files for changes and run the task on update */
gulp.task('watch', function() {
  gulp.watch(input.javascript, ['jshint', 'build']);
  gulp.watch(input.html, ['build']);
  gulp.watch(input.sass, ['build-css']);
});
