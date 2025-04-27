import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';

export default defineConfig([
  {
    input: 'src/background.js',
    output: {
      file: 'dist/background.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production')
        }
      }),
      commonjs(),
      nodeResolve(),
      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: 'src/sidepanel.html', dest: 'dist' },
          { src: 'static', dest: 'dist' }
        ],
      }),
    ],
  },
  {
    input: 'src/sidepanel.jsx',
    output: {
      file: 'dist/sidepanel.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production')
        }
      }),
      babel({
        babelHelpers: 'bundled',
        presets: [['@babel/preset-react', {
          runtime: 'automatic',
        }]],
        extensions: ['.js', '.jsx']
      }),
      commonjs(),
      nodeResolve(),
      css({
        output: 'bundle.css',
        minify: true
      })
    ],
  },
  {
    input: 'src/content.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      commonjs(),
      nodeResolve(),
    ],
  },
]); 