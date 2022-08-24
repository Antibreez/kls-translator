const gulp = require("gulp");

const jsVendor = () => {
  return gulp
    .src("source/js/vendor/**/*", {
      base: "source",
    })
    .pipe(gulp.dest("build"));
};

const files = () => {
  return gulp
    .src(["source/fonts/**/*", "source/*.ico"], {
      base: "source",
    })
    .pipe(gulp.dest("build"));
};

const copy = gulp.series(jsVendor, files);

module.exports = copy;
