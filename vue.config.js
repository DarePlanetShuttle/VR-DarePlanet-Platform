const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  chainWebpack: config => {
    config.plugin('copy').tap(([options]) => {
      options[0].patterns.push({
        from: path.resolve(__dirname, '_redirects'), // Ruta de tu archivo _redirects en el proyecto
        to: path.resolve(__dirname, 'dist'),        // Copia el archivo a la carpeta dist
        toType: 'dir'
      });
      return [options];
    });
  }
});

