const path = require('path');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const handleErrors = require('blendid/gulpfile.js/lib/handleErrors');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const gulpStylelint = require('gulp-stylelint');
const cssnano = require('gulp-cssnano');

module.exports = {
  html: true,
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,
  ghPages: true,

  javascripts: {
    entry: {
      // files paths are relative to
      // javascripts.dest in path-config.json
      app: ['./app.js'],
    },
    customizeWebpackConfig: (webpackConfig) => {
      const config = webpackConfig;

      config.module = {
        rules: [
          // First, run the linter.
          // It's important to do this before Babel processes the JS.
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: [
              {
                options: {
                  formatter: eslintFormatter,
                  eslintPath: require.resolve('eslint'),
                },
                loader: require.resolve('eslint-loader'),
              },
            ],
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx)$/,
            loader: require.resolve('babel-loader'),
            exclude: /node_modules/,
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              preset: ['env'],
            },
          },
        ],
      };

      return config;
    },
  },

  stylesheets: {
    alternateTask: (gulp, PATH_CONFIG, TASK_CONFIG) => (
      () => {
        const paths = {
          src: path.resolve(
            process.env.PWD,
            PATH_CONFIG.src,
            PATH_CONFIG.stylesheets.src,
            `**/*.{${TASK_CONFIG.stylesheets.extensions}}`,
          ),
          dest: path.resolve(
            process.env.PWD,
            PATH_CONFIG.dest,
            PATH_CONFIG.stylesheets.dest,
          ),
        };

        const cssnanoConfig = TASK_CONFIG.stylesheets.cssnano || {};

        // this should always be false, since we're autoprefixing separately
        cssnanoConfig.autoprefixer = false;

        return gulp.src(paths.src)
          .pipe(gulpStylelint({
            reporters: [
              {formatter: 'string', console: true},
            ],
          }))
          .pipe(gulpif(!global.production, sourcemaps.init()))
          .pipe(sass(TASK_CONFIG.stylesheets.sass))
          .on('error', handleErrors)
          .pipe(autoprefixer(TASK_CONFIG.stylesheets.autoprefixer))
          .pipe(gulpif(global.production, cssnano(cssnanoConfig)))
          .pipe(gulpif(!global.production, sourcemaps.write()))
          .pipe(gulp.dest(paths.dest))
          .pipe(browserSync.stream());
      }
    ),
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: 'build',
    },
  },

  production: {
    rev: true,
  },
};
