const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const paths = require("./paths");

const globals = require("./globals.js");

module.exports = {
	entry: paths.src + "/index.ts",
	output: {
		path: paths.build,
		filename: "index.js",
	},
	resolve: {
		symlinks: false,
		extensions: [".js", ".ts"],
		alias: {
			"@assets": paths.public + "/static/assets",
			"@pubSub": paths.src + "/pubSub",
			"@enums": paths.src + "/enums",
			"@store": paths.src + "/store",
			"@static": paths.public + "/static",
			"@config": paths.src + "/config",
			"@webgl": paths.src + "/webgl",
			"@app": paths.src + "/app",
			"@": paths.src + "/",
		},
	},
	plugins: [
		new NodePolyfillPlugin(),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: paths.src + "/index.html",
			favicon: paths.src + "/images/favicon.ico",
			filename: "index.html",
			templateParameters: globals,
		}),
	],
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|dds|hdr|obj|fbx|glb|gltf|fnt|csv|zpt|svg)$/i,
				loader: "file-loader",
			},
			{
				test: /\.(glsl|vs|fs|vert|frag)$/,
				exclude: /node_modules/,
				use: ["ts-shader-loader"],
			},
			{
				test: /zcv\.wasm$/,
				type: "javascript/auto",
				loader: "file-loader",
			},
			{
				test: /\.ts?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
};
