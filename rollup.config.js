import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // postcss({
    //   extract: true
    // }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // preprocess: {
      //   style: sass({
      //     all: true,
      //     includePaths: ['src', 'node_modules']
      //   })
      // },
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write('public/bundle.css');
      },
      onwarn: (warning, handler) => {
        // don't warn on # href ally
        if (warning.code === 'a11y-invalid-attribute') return;
        // but let Rollup handle all other warnings normally
        handler(warning);
      }
    }),
    // Babel is being used to make ES2015 features (like arrow functions) available to all browsers. This is called *transpiling*. Additionally babel using using core-js to create *pollyfills* to make turn some JS features that don't exist in some browsers into compatible ones that do exist. This has to increase bundle size a bit but that's the cost of higher compatibility. Refs: 
    // http://simey.me/svelte3-rollup-and-babel7/
    // https://github.com/sveltejs/svelte/issues/3388
    // https://github.com/sveltejs/svelte/issues/2621
    // https://blog.az.sg/posts/svelte-and-ie11/
    babel({
      extensions: [".js", ".mjs", ".html", ".svelte"],
      include: ['src/**', 'node_modules/svelte/**'],
      runtimeHelpers: true,
      presets: [
        [
          '@babel/preset-env',
          {
            "debug": false,
            useBuiltIns: 'usage',
            corejs: 3,
            targets: "> 0.25%, not dead"
          },
        ],
      ],
    }),
    postcss(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({ browser: true }),
    commonjs(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload({ watch: 'public', port: 8080 }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};