var gulp = require('gulp'),
	sass = require('gulp-sass'),
	webserver = require('gulp-webserver'),
	cleanCSS = require('gulp-clean-css'),
	gulpCopy = require('gulp-copy'),
	webpack = require('webpack'),
	webpackConfig = require('./webpack.config.js'),
	uglify = require('gulp-uglify'),
	livereload = require('gulp-livereload');

var PAGE = process.env.PAGE;
var MODE = process.env.MODE;

gulp.task('webserver', () => {
	gulp.src('./' + PAGE + '')
		.pipe(webserver({
			livereload: true,
			open: true
		}));
});

gulp.task('webpack', callback => {
	webpack(webpackConfig, () => {
		if(MODE === 'build'){
			gulp.src('./'+PAGE+'/js/*.min.js')
			.pipe(uglify())
			.pipe(gulp.dest('./'+PAGE+'/js'));
		}
		callback();
	});
});

gulp.task('sass', function() {
	return gulp.src('./' + PAGE + '/css/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(cleanCSS({
			compatibility: 'ie9'
		}))
		.pipe(gulp.dest('./' + PAGE + '/css'));
});

gulp.task('copy', function() {
	return gulp.src(['./' + PAGE + '/**/*min.js', './' + PAGE + '/**/*.css', './' + PAGE + '/**/*.html', './' + PAGE + '/**/*.jpg', './' + PAGE + '/**/*.jpeg', './' + PAGE + '/**/*.png'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('watch', () => {
	gulp.watch('./' + PAGE + '/**/*.html', ['']);
	gulp.watch('./' + PAGE + '/**/*.scss', ['sass']);
	gulp.watch('./' + PAGE + '/**/*.es6.js', ['webpack']);
});

gulp.task('dev', ['sass', 'webpack', 'webserver', 'watch']);
gulp.task('build', ['sass', 'webpack', 'copy']);