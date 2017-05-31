var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var PAGE = process.env.PAGE;
var pageConfig = require('./'+PAGE+'/webpack');
module.exports = {
	entry: pageConfig.entry,
	output: {
		path: './'+PAGE+'/js',
		filename: '[name].min.js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015']
			}
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		},
		{
			test: /\.scss/,
			loader: 'css-loader!sass-loader'
		},
		{
			test: /\.html/,
			loader: 'html-loader'
		}, {
			test: /\.(png|jpg|gif|svg)$/,
			loader: 'url',
			query: {
				limit: 10000,
				filename: "src/img",
				name: '[name].[ext]?[hash]'
			}
		}]
	},
//	plugins: [
//		new CommonsChunkPlugin({
//			filename: "src/common/allcommon.min.js",
//			name: "allcommon"
//		})
//		new CommonsChunkPlugin("admin-commons.js", ["ap1", "ap2"])
//	]
}