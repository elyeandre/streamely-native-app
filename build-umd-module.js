const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './provider/lib/index.js', // Update with your entry file
  output: {
    filename: 'provider.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'provider', // Replace with the desired global variable name
    libraryTarget: 'umd', // Use 'umd' for compatibility with various module systems
    globalObject: 'this'
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true
      })
    ]
  }
};
