const { PrismaClient: MongoPrismaClient } = require('../generated/mongo');
const mongo = new MongoPrismaClient();
module.exports = mongo;
