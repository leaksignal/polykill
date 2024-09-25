import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from 'rollup-plugin-replace';

const common = {
	output: {
		dir: 'dist',
		format: 'cjs'
	},
	plugins: [
		// https://github.com/rollup/rollup/issues/487
		replace({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		typescript(),
		commonjs({
			requireReturnsDefault: 'auto'
		}),
		resolve()
	]
};

export default [
	{
		input: 'src/inject.ts',
		...common
	},
	{
		input: 'src/background.ts',
		...common
	}
];
