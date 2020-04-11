const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const {
  override,
  addWebpackPlugin,
  fixBabelImports,
  addDecoratorsLegacy,
  disableEsLint
} = require('customize-cra')

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css'
  }),
  addWebpackPlugin(new AntdDayjsWebpackPlugin())
)
