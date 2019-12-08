var path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  entry: {
    'my-lib': './src/form.ts',
    'my-lib.min': './src/form.ts'
  },
  output: {
    path: path.resolve(__dirname, '_bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'mega-nice-form',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        declaration: false
      }
    ]
  },
  plugins: [
      new CheckerPlugin()
  ]
}