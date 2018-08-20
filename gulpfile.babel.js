'use strict';

import gulp from 'gulp'
import sass from 'gulp-sass'
import pug from 'gulp-pug'
import concat from 'gulp-concat'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import imagemin from 'gulp-imagemin'
import rename from 'gulp-rename'
import autoprefixer from 'autoprefixer'
import uglify from 'gulp-uglify'
import ftp from 'vinyl-ftp'
import surge from 'gulp-surge'
import babel from 'gulp-babel'
// import cssimport from 'gulp-cssimport'
import uncss from 'gulp-uncss'
import cssmin from 'gulp-cssnano'
import sourcemaps from 'gulp-sourcemaps'
import critical from 'critical'

import postcss from 'gulp-postcss'
import rucksack from 'rucksack-css'

/* baseDirs: baseDirs for the project */

const baseDirs = {
	dist: 'dist/',
	src: 'src/',
	node: 'node_modules/',
	assets: 'dist/assets/'
};

/* routes: object that contains the paths */

const routes = {
	styles: {
		scss: `${baseDirs.src}styles/*.scss`,
		_scss: `${baseDirs.src}styles/**/*.+(scss|sass)`,
		css: `${baseDirs.dist}assets/css/`
	},

	templates: {
		pug: `${baseDirs.src}templates/*.+(pug|html)`,
		_pug: `${baseDirs.src}templates/_includes/*.+(pug|html)`
	},

	scripts: {
		base: `${baseDirs.src}scripts/`,
		js: `${baseDirs.src}scripts/*.js`,
		jquery: `${baseDirs.node}jquery/dist/jquery.slim.min.js`,
		bootstrap: `${baseDirs.node}bootstrap/dist/js/bootstrap.bundle.min.js`,
		jsmin: `${baseDirs.dist}assets/js/`

	},

	files: {
		html: 'dist/',
		images: `${baseDirs.src}images/*`,
		imgmin: `${baseDirs.dist}assets/files/img/`,
		cssFiles: `${baseDirs.dist}assets/css/*.css`,
		htmlFiles: `${baseDirs.dist}*.html`,
		styleCss: `${baseDirs.dist}assets/css/style.css`
	},

	deployDirs: {
		baseDir: baseDirs.dist,
		baseDirFiles: `${baseDirs.dist}**`,
		ftpUploadDir: 'FTP-DIRECTORY'
	}
};

/* ftpCredentials: info used to deploy @ ftp server */

const ftpCredentials = {
	host: 'HOST',
	user: 'USER',
	password: 'PASSWORD'
};

const surgeInfo = {
	domain: 'YOURDOMAIN.surge.sh'
};

/* Compiling Tasks */

// pug

gulp.task('templates', () => {
	return gulp.src([routes.templates.pug, '!' + routes.templates._pug])
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: Compiling pug.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(pug())
		.pipe(gulp.dest(routes.files.html))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'Pug Compiled succesfully!',
			message: 'Pug task completed.'
		}));
});

// SCSS

gulp.task('styles', () => {
	let plugins = [
		autoprefixer({browsers: ['last 2 version']}),
		rucksack()
	];
	return gulp.src(routes.styles.scss)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: Compiling SCSS.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(postcss(plugins))
		// .pipe(cssimport({}))
		.pipe(rename('style.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(routes.styles.css))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'SCSS Compiled and Minified succesfully!',
			message: 'scss task completed.'
		}));
});

/* Scripts (js) ES6 => ES5, minify and concat into a single file. */
/* Adds Jquery and Bootstrap 4 JS files -
	- remove them if you are not plannig to use BS4 */

gulp.task('scripts', () => {
	return gulp.src([routes.scripts.jquery, routes.scripts.bootstrap, routes.scripts.js])
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: Babel and Concat failed.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(routes.scripts.jsmin))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'JavaScript Minified and Concatenated!',
			message: 'your js files has been minified and concatenated.'
		}));
});

/* Image compressing task */

gulp.task('images', () => {
	gulp.src(routes.files.images)
		.pipe(imagemin())
		.pipe(gulp.dest(routes.files.imgmin));
});

/* Deploy, deploy dist/ files to an ftp server */

gulp.task('ftp', () => {
	const connection = ftp.create({
		host: ftpCredentials.host,
		user: ftpCredentials.user,
		password: ftpCredentials.password
	});

	return gulp.src(routes.deployDirs.baseDirFiles, {
		base: routes.deployDirs.baseDir,
		buffer: false
	})
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: Deploy failed.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(connection.dest(routes.deployDirs.ftpUploadDir))
		.pipe(notify({
			title: 'Deploy succesful!',
			message: 'Your deploy has been done!.'
		}));
});

gulp.task('surge', () => {
	return surge({
		project: routes.deployDirs.baseDir,
		domain: surgeInfo.domain
	});
});

/* Serving (browserSync) and watching for changes in files */

gulp.task('serve', () => {
	browserSync.init({
		server: './dist/',
		browser: "google chrome"
	});

	gulp.watch([routes.styles.scss, routes.styles._scss], ['styles']);
	gulp.watch([routes.templates.pug, routes.templates._pug], ['templates']);
	gulp.watch(routes.scripts.js, ['scripts']);
});

/* Remove unusued css */

gulp.task('uncss', () => {
	return gulp.src(routes.files.cssFiles)
		.pipe(uncss({
			html: [routes.files.htmlFiles],
			ignore: [
				"*:*",
				".show",
				".active",
				".btn",
				".focus",
				".slide",
				".collapse",
				".collapsed",
				".disabled",
				".position-static",
				".fade",
				".collapsing",

				".dropup",
				".dropdown",
				".dropleft",
				".dropright",
				".dropup .dropdown-menu",
				".dropleft .dropdown-menu",
				".dropright .dropdown-menu",

				".dropdown-menu",
				".dropdown-menu.show",
				".dropdown-menu-left",
				".dropdown-menu-right",
				".dropdown-divider",
				".dropdown-item",
				".dropdown-toggle-split",
				".btn-group-sm>.btn+.dropdown-toggle-split",
				".btn-group-lg>.btn+.dropdown-toggle-split",
				".btn-sm+.dropdown-toggle-split",
				".btn-lg+.dropdown-toggle-split",

				".nav-link.disabled",
				".navbar-nav .dropdown-menu",
				".navbar-collapse",
				".navbar-toggler",

				".alert",
				".alert-dismissible",
				".alert-dismissible .close",

				".close",
				".button.close",

				".modal",
				".modal-open",
				".modal-open .modal",
				".modal.fade .modal-dialog",
				".modal.show .modal-dialog",
				".modal-backdrop",
				".modal-backdrop.fade",
				".modal-backdrop.show",
				".modal-header .close",
				".modal-scrollbar-measure",

				".carousel",
				".carousel-inner",
				".carousel-item",
				".carousel-item.active",
				".carousel-item-next.carousel-item-left",
				".carousel-item-prev.carousel-item-right",
				".carousel-item-left",
				".carousel-item-right",
				".carousel-item-prev",
				".carousel-item-next",
				".active.carousel-item-left",
				".active.carousel-item-right",
				".active.carousel-item-prev",
				".carousel-control-prev",
				".carousel-control-next",
				".carousel-control-prev-icon",
				".carousel-control-next-icon",
				".carousel-caption",
				".carousel-fade",
				".carousel-fade .carousel-item",
				".carousel-fade .carousel-item.active",
				".carousel-fade .carousel-item-next.carousel-item-left",
				".carousel-fade .carousel-item-prev.carousel-item-right",
				".carousel-fade .carousel-item-prev",
				".carousel-fade .carousel-item-next",
				".carousel-fade .active.carousel-item-left",
				".carousel-fade .active.carousel-item-right",
				".carousel-fade .active.carousel-item-prev",
				".carousel-indicators",
				".carousel-indicators li",
				".carousel-indicators .active",
			]
		}))
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: UnCSS failed.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(routes.styles.css))
		.pipe(notify({
			title: 'Removed unusued CSS',
			message: 'UnCSS completed!'
		}));
});

/* Extract CSS critical-path */

gulp.task('critical', () => {
	return gulp.src(routes.files.htmlFiles)
		.pipe(critical.stream({
			base: baseDirs.dist,
			inline: true,
			minify: true,
			html: routes.files.htmlFiles,
			css: routes.files.styleCss,
			ignore: ['@font-face', /url\(/],
			width: 1300,
			height: 900
		}))
			.pipe(plumber({
				errorHandler: notify.onError({
					title: 'Error: Critical failed.',
					message: '<%= error.message %>'
				})
			}))
			.pipe(gulp.dest(baseDirs.dist))
			.pipe(notify({
				title: 'Critical Path completed!',
				message: 'css critical path done!'
			}));
});

gulp.task('dev', ['templates', 'styles', 'scripts', 'serve']);

gulp.task('build', ['templates', 'styles', 'scripts']);

gulp.task('optimize', ['uncss', 'critical', 'images']);

gulp.task('deploy', ['optimize', 'surge']);

gulp.task('default', () => {
	gulp.start('dev');
});
