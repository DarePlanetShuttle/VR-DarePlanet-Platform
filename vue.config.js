const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  chainWebpack: config => {
    config.plugin('copy').tap(([options]) => {
      // Verificamos si 'patterns' existe. Si no, lo creamos como un array vacío.
      if (!options[0].patterns) {
        options[0].patterns = [];
      }
      
      // Agregamos la nueva redirección a las patterns
      options[0].patterns.push({
        from: path.resolve(__dirname, '_redirects'),
        to: path.resolve(__dirname, 'dist'),
        toType: 'dir'
      });

      return [options];
    });
  }
});
