const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();
    console.log('cleanCache')
    clearHash(req.user.id);

}