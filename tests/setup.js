const mongoose = require('mongoose');
const keys = require('../config/keys');
require('../models/User');

jest.setTimeout(30000)
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true })