const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const keys= require('../config/keys')

const redis = require('redis')
const client = redis.createClient(keys.redisUrl)
const util = require('util');
client.hget = util.promisify(client.hget);


mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name })
    const cachedValue = await client.hget(this.hashKey, key)

    if (cachedValue) {
        console.log('cached');
        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc)
            ? doc.map(item => new this.model(item))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    console.log('get from mongo')
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;
}

module.exports = {
    clearHash: function(hashKey){
        client.del(JSON.stringify(hashKey));
    }
}