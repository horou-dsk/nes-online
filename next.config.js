module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl$/i,
      use: 'raw-loader',
    })

    return config
  },
}
