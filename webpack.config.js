const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  target: "node",
  entry: "./src/index.ts",
  output: {
    fileName: "vs-presence.js",
    libraryTarget: "commonjs2",
    path: path.resolve(process.cwd(), 'out'),
  },
  devtool: 'source-map',
	externals: {
		vscode: 'commonjs vscode',
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
	},
  plugins: [new CleanWebpackPlugin()],
  optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: true,
				terserOptions: {
					output: {
						comments: false,
					},
					mangle: false,
					keep_classnames: true,
					keep_fnames: true,
				},
			}),
		],
	},
  module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
}
