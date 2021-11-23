import babel from '@rollup/plugin-babel';
import tsc from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import autoprefixer from 'autoprefixer';

const extensions = ['js', 'jsx', 'ts', 'tsx'];

export default {
    input: './src/index.ts',
    output: [
        {
            file: './lib/index.js',
            sourcemap: true,
            format: 'cjs',
            esModule: false,
        },
        {
            file: './es/index.js',
            sourcemap: true,
            format: 'esm',
        },
    ],
    external: ['exceljs', 'lodash-es'],
    plugins: [
        image(),
        postcss({
            plugins: [simplevars(), nested(), autoprefixer()],
            minimize: true,
            extensions: ['.css', '.less'],
            use: [
                [
                    'less',
                    {
                        javascriptEnabled: true,
                    },
                ],
            ],
        }),
        json(),
        resolve({ extensions }),
        commonjs(),
        tsc({
            tsconfig: './tsconfig.json',
        }),
        babel({
            extensions,
            babelHelpers: 'runtime',
            exclude: /node_modules/,
        }),
        terser(),
    ],
};
