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
import cssimport from 'gulp-cssimport'
import uncss from 'gulp-uncss'
import cssmin from 'gulp-cssnano'
import sourcemaps from 'gulp-sourcemaps'
import critical from 'critical'

import postcss from 'gulp-postcss'
import rucksack from 'rucksack-css'
import child from 'child_process'

import realFavicon from 'gulp-real-favicon'
import fs from 'fs'
import runSequence from 'run-sequence'
import cache from 'gulp-cache'
import htmlmin from 'gulp-htmlmin'

/* baseDirs: baseDirs for the project */

const baseDirs = {
	dist: '_site/',
	src: 'assets/',
	node: 'node_modules/',
	assets: '_site/assets/'
};

/* routes: object that contains the paths */

const routes = {
	styles: {
		base: `${baseDirs.src}css/`,
		scss: `${baseDirs.src}css/*.scss`,
		_scss: `${baseDirs.src}css/**/*.+(scss|sass)`,
		css: `${baseDirs.dist}assets/css/`
	},

	templates: {
		pug: `_pug/*.+(pug|html)`,
		_pug: `${baseDirs.src}templates/_includes/*.+(pug|html)`,
		includes: `_includes/`
	},

	scripts: {
		base: `${baseDirs.src}js/`,
		js: `${baseDirs.src}js/main/*.js`,
		jquery: `${baseDirs.node}jquery/dist/jquery.slim.min.js`,
		bootstrap: `${baseDirs.node}bootstrap/dist/js/bootstrap.bundle.min.js`,
		jsmin: `${baseDirs.dist}assets/js/`

	},

	files: {
		html: '_site/',
		images: `${baseDirs.src}images/**/*.+(png|jpg|jpeg|gif|svg)`,
		favicon_master: `${baseDirs.src}images/favicons/fav_master.png`,
		favicons_gen: `${baseDirs.src}images/favicons/generated/`,
		imgmin: `${baseDirs.dist}assets/images/`,
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

const messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

gulp.task('jekyll-build', (done) => {
	browserSync.notify(messages.jekyllBuild);
	return child.spawn('jekyll', ['build'], {stdio: 'inherit'})
			.on('close', done);
});

/* Rebuild Jekyll & do page reload when watched files change */

gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
	browserSync.reload();
});

/* Compiles all Pug files into HTML */

gulp.task('templates', () => {
	return gulp.src([routes.templates.pug/* , '!' + routes.templates._pug */])
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Error: Compiling pug.',
				message: '<%= error.message %>'
			})
		}))
		.pipe(pug())
		.pipe(gulp.dest(routes.templates.includes))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'Pug Compiled succesfully!',
			message: 'Pug task completed.'
		}));
});

/* Compiles all Sass/Scss files into CSS */

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
		.pipe(rename('style.css'))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(postcss(plugins))
		.pipe(cssimport({}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(routes.styles.css))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(routes.styles.base))
		.pipe(notify({
			title: 'SCSS Compiled and Minified succesfully!',
			message: 'scss task completed.'
		}));
});

/* Scripts (js) ES6 => ES5, minify and concat into a single file. */
/* Adds Jquery and Bootstrap 4 JS files -
	- remove routes.scripts.jquery, routes.scripts.bootstrap if you don't use BS4 */

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
		.pipe(gulp.dest(routes.scripts.base))
		.pipe(notify({
			title: 'JavaScript Minified and Concatenated!',
			message: 'your js files has been minified and concatenated.'
		}));
});

/* Image compressing task */

gulp.task('images', () => {
	return gulp.src([routes.files.images, '!' + routes.files.favicons])
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest(routes.files.imgmin));
});

/* Deploy _site/ files to an ftp server */

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

gulp.task('serve', ['jekyll-build'], () => {
	browserSync.init({
		server: './_site/',
		browser: "google chrome"
	});

	gulp.watch(['*.html', '_layouts/*.html', '_includes/*', '_posts/*'], ['jekyll-rebuild']);
	gulp.watch([routes.styles.scss, routes.styles._scss], ['styles']);
	gulp.watch(routes.templates.pug, ['templates']);
	gulp.watch(routes.scripts.js, ['scripts']);
});

/* Remove unusued CSS */

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
			.pipe(htmlmin({
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				decodeEntities: true,
				html5: true,
				minifyCSS: true,
				processConditionalComments: true,
				removeAttributeQuotes: true,
				removeComments: true,
				removeEmptyAttributes: true,
				removeOptionalTags: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
			}))
			.pipe(gulp.dest(baseDirs.dist))
			.pipe(notify({
				title: 'Critical Path completed!',
				message: 'css critical path done!'
			}));
});

/* Generates Favicons */
/* File where the favicon markups are stored */
const FAVICON_DATA_FILE = 'faviconData.json';

/* For the best effect, (you need to do this only once)
	first go to this site https://realfavicongenerator.net
	submit your master picture, then select settings for different
	devices and click 'Generate your favicon..'. Go to the Gulp tab
	and swap the 'design: {...}' part of the 'generate-favicon' task
	with the same part in the task below.
	Generate the icons. This task takes a few seconds to complete.
	You should run it at least once to create the icons. Then,
	you should run it whenever RealFaviconGenerator updates its
	package (see the check-for-favicon-update task below).

	Important! - if fav_master file is not a .png, file extenssion
		must be changed in the routes links above */
gulp.task('generate-favicon', (done) => {
	realFavicon.generateFavicon({
		masterPicture: routes.files.favicon_master,
		dest: routes.files.favicons_gen,
		iconsPath: routes.files.favicons_gen,
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#ffffff',
				margin: '14%',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#2b5797',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'shadow',
				themeColor: '#ffffff',
				manifest: {
					name: 'OcbStarterKit',
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 76.5625,
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, () => {
		done();
	});
});

/* Inject the favicon markups in your HTML pages. You should run
	this task whenever you modify a page. You can keep this task
	as is or refactor your existing HTML pipeline. */
gulp.task('inject-favicon-markups', ['generate-favicon'], () => {
	return gulp.src(routes.files.htmlFiles)
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest(baseDirs.dist));
});

/* Check for updates on RealFaviconGenerator (think: Apple has just
	released a new Touch icon along with the latest version of iOS).
	Run this task from time to time. Ideally, make it part of your
	continuous integration system. */
gulp.task('check-for-favicon-update', (done) => {
	const currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, (err) => {
		if (err) {
			throw err;
		}
	});
});

/* Gulp Tasks */

gulp.task('dev', (callback) => {
	runSequence('templates', 'styles', 'scripts', 'serve', callback)
});

gulp.task('optimize', (callback) => {
	runSequence('inject-favicon-markups', ['uncss', 'critical', 'images'], callback)
});

gulp.task('deploy', (callback) => {
	runSequence('optimize', 'surge', callback)
});

gulp.task('default', () => {
	gulp.start('dev');
});
