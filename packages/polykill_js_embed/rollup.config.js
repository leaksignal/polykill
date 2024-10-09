import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from 'rollup-plugin-replace';

export default {
	input: 'src/polykill-embed.ts',
	output: {
		dir: 'dist',
		format: 'cjs'
	},
	plugins: [
		nodeResolve({ browser: true }),
		commonjs({
			requireReturnsDefault: 'auto'
		}),
		// https://github.com/rollup/rollup/issues/487
		replace({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		typescript()
	]
};
