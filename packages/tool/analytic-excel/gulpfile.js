const del = require('del');

const clean = async () => {
    await del('./es');
    await del('./lib');
};

exports.clean = clean;
