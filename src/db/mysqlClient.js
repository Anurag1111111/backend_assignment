const { PrismaClient: MySQLPrismaClient } = require('../generated/mysql');
const mysql = new MySQLPrismaClient();
module.exports = mysql;
