const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',

	entry: {
	  index: './src/index.js',
	},

	output: {
	  filename: '[name].[hash:5].js',
	  path: path.resolve(__dirname, 'dist'),
	  clean: true,
	},

	devtool: 'inline-source-map',
	devServer: {
	  static: './dist',
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Hello Xiaoxi',
			favicon: path.resolve('./src/assets/icon.png'),
			filename: path.resolve(__dirname, './dist/index.html'),
			template: path.resolve(__dirname, './src/index.html'),
			chunks: ['index'],
		}),
	    new CopyWebpackPlugin({
		  patterns:[
			{
				from: path.resolve(__dirname, './src/assets'),
				to: path.resolve(__dirname, './dist/assets'),
			},
			// {
			//   from: path.resolve(__dirname, './src/icon.png'),
			//   to: path.resolve(__dirname, './dist/icon.png'),
			// },
			{
			  from: path.resolve(__dirname, './src/main.css'),
			  to: path.resolve(__dirname, './dist/main.css'),
			},
		  ]
		}),
	],
};
