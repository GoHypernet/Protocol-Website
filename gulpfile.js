var syntax = "sass"; // Syntax: sass or scss;

var gulp = require("gulp"),
  gutil = require("gulp-util"),
  sass = require("gulp-sass"),
  browsersync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  notify = require("gulp-notify"),
  rsync = require("gulp-rsync"),
  deploy = require("gulp-gh-pages"),
  useref = require("gulp-useref"),
  imagemin = require("gulp-imagemin"),
  cssnano = require("gulp-cssnano"),
  gulpIf = require("gulp-if");

gulp.task("browser-sync", function () {
  browsersync({
    server: {
      baseDir: "app",
    },
    notify: false,
    // open: false,
    // tunnel: true,
    // tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
  });
});

gulp.task("styles", function () {
  return gulp
    .src("app/" + syntax + "/**/*." + syntax + "")
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest("app/css"))
    .pipe(browsersync.reload({ stream: true }));
});

gulp.task("js", function () {
  return (
    gulp
      .src([
        // 'app/libs/jquery/dist/jquery.min.js',
        "app/libs/OwlCarousel/owl.carousel.min.js",
        "app/libs/CounterUp/jquery.countup.min.js",
        "app/libs/CounterUp/waypoint.js",
        "app/libs/magnific/jquery.magnific-popup.min.js",
        "app/libs/validate/jquery.validate.min.js",
        "app/libs/chart/chart.js",
        "app/libs/chart/chart.bundle.js",
        "app/libs/jarallax-master/dist/jarallax.min.js",
        "app/libs/jarallax-master/dist/jarallax-element.min.js",
        "app/libs/flipclock/flipclock.min.js",
        "app/libs/aos-master/aos.js",
        "app/js/common.js", // Always at the end
      ])
      .pipe(concat("scripts.min.js"))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest("app/js"))
      .pipe(browsersync.reload({ stream: true }))
  );
});

gulp.task("rsync", function () {
  return gulp.src("app/**").pipe(
    rsync({
      root: "app/",
      hostname: "username@yousite.com",
      destination: "yousite/public_html/",
      // include: ['*.htaccess'], // Includes files to deploy
      exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excludes files from deploy
      recursive: true,
      archive: true,
      silent: false,
      compress: true,
    })
  );
});

gulp.task("watch", ["styles", "js", "browser-sync"], function () {
  gulp.watch("app/" + syntax + "/**/*." + syntax + "", ["styles"]);
  gulp.watch(["libs/**/*.js", "app/js/common.js"], ["js"]);
  gulp.watch("app/*.html", browsersync.reload);
});

gulp.task("default", ["watch"]);

/**
 * Push build to gh-pages
 */
gulp.task("deploy", function () {
  return gulp.src("./dist/**/*").pipe(deploy());
});

gulp.task("create-dist", function () {
  return gulp
    .src("app/*.html")
    .pipe(useref())
    .pipe(gulpIf("app/js/*.js", uglify()))
    .pipe(gulpIf("app/css/*.css", cssnano()))
    .pipe(gulp.dest("dist"));
});

gulp.task("copy-js", function () {
  return gulp.src("app/js/*.js").pipe(gulp.dest("dist/js"));
});

gulp.task("copy-css", function () {
  return gulp.src("app/css/*.css").pipe(gulp.dest("dist/css"));
});

gulp.task("images", function () {
  return gulp
    .src("app/img/**/*.+(png|jpg|gif|svg)")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/img"));
});
