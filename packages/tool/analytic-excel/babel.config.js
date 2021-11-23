const CommonBabelConfig = require('../../../common.babel.config');

module.exports = {
    presets: [...CommonBabelConfig.presets],
    plugins: [...CommonBabelConfig.plugins],
};
