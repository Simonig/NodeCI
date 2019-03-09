const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;

const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl)
const util = require('util');
client.get = util.promisify(client.get);


mongoose.Query.prototype.cache = function () {
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name })
    const cachedValue = await client.get(key)
    console.log('cached');

    if (cachedValue) {
        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc)
            ? doc.map(item => new this.model(item))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result));

    return result;
}