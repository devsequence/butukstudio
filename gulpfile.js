var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    watch = require('gulp-watch'),
    runSequence = require('gulp4-run-sequence');
const sass = require('gulp-sass')(require('sass'));
var rename = require("gulp-rename");
var rimraf = require("rimraf");
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const postcss = require('gulp-postcss');
var cssnano = require('cssnano');
var path = require('path');
var svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

gulp.task('build:clean', function(cb){
    rimraf('./dist/**/*', cb);
});


gulp.task('build:production', function () {
    var processors = [
        autoprefixer({ overrideBrowserslist: ['last 2 versions'],
            cascade: false}),
        cssnano()
    ];

    gulp.src('src/static/css/index.css')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dist/static/css/'))


    return gulp.src('./src/preview/*.html')
        .pipe(useref())
        // .pipe(gulpif('*.css', postcss(processors)))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulp.dest('./dist/html'));
});

gulp.task('build:move', function() {
    gulp.src('./src/static/fonts/**/*')
        .pipe(gulp.dest('./dist/static/fonts'));

    gulp.src('./src/static/js/**/*')
        .pipe(gulp.dest('./dist/static/js'));

    gulp.src('./src/static/css/**/*')
        .pipe(gulp.dest('./dist/static/css'));

    gulp.src('./src/static/images/**/*')
        .pipe(gulp.dest('./dist/static/images'));
});


gulp.task('dev:svg', function () {
    return gulp.src('./src/static/images/svg/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
                $('[class]').removeAttr('class');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "icons.html"
                }
            }
        }))
        .pipe(gulp.dest('./src/html/includes/'));
});
gulp.task('dev:html', function () {
    return gulp.src('./src/html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./src/preview'))
});

gulp.task('dev:css', function () {
    return gulp.src('./src/static/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ overrideBrowserslist: ['last 2 versions'],
            cascade: false}) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./src/static/css'))

        .pipe(browserSync.stream())
});
gulp.task('build', function () {
    runSequence('build:production', 'dev:autoprefixerCss', 'dev:minifyCss');
});

gulp.task('dev:reload', function(){
    browserSync.reload();
});

gulp.task('dev:serve', function(){
    browserSync.init({
        server: {
            baseDir: './',
            directory: true
        },
        startPath: './src/preview'
    });

    watch("./src/html/**/*.html", function () {
        runSequence('dev:html', 'dev:reload');
    });

    watch("./src/static/scss/**/*.scss", function () {
        runSequence('dev:css');
    });

    watch("./src/static/js/**/*.js", function () {
        runSequence('dev:reload');
    });

    watch("./src/static/images/svg/*.svg", function () {
        runSequence('dev:svg');
    });
});
gulp.task('dev', function () {
    runSequence(['dev:html', 'dev:css'], 'dev:serve');
});


const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');

gulp.task('convert:webp', function () {
    return gulp.src('./src/static/images/**/*.{jpg,jpeg,png}')
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
        ]))
        .pipe(webp())
        .pipe(gulp.dest('./src/static/images/webp'));
});