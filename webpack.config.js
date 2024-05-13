const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './dist/card/massa-node-card.js',
    output: {
      filename: 'massa-node-card.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      fallback: {
        url: require.resolve('url/')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  }
]
