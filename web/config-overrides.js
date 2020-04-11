const {
  override,
  addDecoratorsLegacy,
  disableEsLint
} = require('customize-cra')

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
)
