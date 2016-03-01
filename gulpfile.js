/**
 * Created by home on 2/27/2016.
 */

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    gzip = require('gulp-gzip'),
    livereload = require('gulp-livereload'),
    babel = require('gulp-babel'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    del = require('del');

var gzip_options = {
    threshold: '1kb',
    gzipOptions: {
        level: 9
    }
};

gulp.task('clean-temp', function(){
    return del(['components/es5']);
});

gulp.task('es6-commonjs',['clean-temp'], function(){
    return gulp.src(['components/es2015/*.js','components/es2015/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('components/es5/temp'))
        .pipe(livereload());
});


/*Compile Sass files*/
gulp.task('sass', ['clean-stylesheets'],function() {
    return gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('stylesheets'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('stylesheets'))
        .pipe(gzip(gzip_options))
        .pipe(gulp.dest('stylesheets'))
        .pipe(livereload());
});

gulp.task('clean-stylesheets', function(){
    return del(['stylesheets/*.css']);
});


/*Watch files for changes*/
gulp.task('watch', function(){
    livereload.listen();
    gulp.watch('components/es2015/*.js', ['es6-commonjs']);
    gulp.watch('scss/*.scss', ['sass']);

    gulp.watch('index.html').on('change', livereload.changed);
});

/*gulp.task('bundle-commonjs-clean', function(){
    return del(['es5/commonjs']);
});

gulp.task('commonjs-bundle',['bundle-commonjs-clean','es6-commonjs'], function(){
    return browserify(['components/es5/temp/date-widget.comp.js']).bundle()
        .pipe(source('date-widget.es2015.comp.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename('date-widget.es2015.comp.js'))
        .pipe(gulp.dest("es5/commonjs"));
});


gulp.task('commonjs', ['commonjs-bundle']);*/
gulp.task('default',['es6-commonjs', 'sass', 'watch']);
gulp.watch('components/es2015/*.js');