/**
 * @file schemas/index.js
 * @description Aggregates GraphQL type definitions and resolvers for Apollo Server.
 */
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

/**
 * @exports {typeDefs, resolvers}
 * Provides schema and resolvers to Apollo Server
 */
module.exports = { typeDefs, resolvers };