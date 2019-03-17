const Keygrip = require('keygrip');
const keys = require('../../config/keys')
const Buffer = require('safe-buffer').Buffer;
const keygrip = new Keygrip([keys.cookieKey])


module.exports = (user) => {
    //const id = '5c7d8c95a1418831c1788d31';
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    }
    const session = Buffer.from(
        JSON.stringify(sessionObject)).toString('base64')

    const sig = keygrip.sign('session=' + session);

    return { session, sig };
}