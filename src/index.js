const { ApolloServer, gql } = require('apollo-server');
const express = require('express');
const { readFileSync } = require('fs');
const {resolvers} = require(`./resolvers`);
const databaseConnection = require('./connections/databaseConfiguration.js');
const SiteLevelServiceAPI = require('./dataSources/siteLevelServiceAPI');
const SubaccountLevelServiceAPI = require('./dataSources/subaccountLevelServiceAPI');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const visualizationDataLoader = require('./loaders/visualizationDataLoader');
const descriptorDataLoader = require('./loaders/descriptorDataLoader');
const catalogDataLoader = require('./loaders/catalogDataLoader');
const descriptorRefDataLoader = require('./loaders/descriptorRefDataLoader');
const dbInit = require('./database/schema-init');

if(process.env.NODE_ENV !== 'development'){
  // initializeSecurity(app);
}

const context = async ({  }) => {};

const dataSources = (req) => ({
  subaccountLevelServiceAPI: new SubaccountLevelServiceAPI(databaseConnection),
  siteLevelServiceAPI: new SiteLevelServiceAPI(databaseConnection),
  zoneId: req && req.authInfo && req.getZoneId() || '5f972faf-2b27-482b-9b09-3f1cfd3de63d',
  context,
  visualizationDataLoader,
  descriptorDataLoader,
  catalogDataLoader,
  descriptorRefDataLoader
});

const plugins = [
  {
    async requestDidStart(obj) {
      const trx = await databaseConnection.transaction();
      obj.context.batchResponses = [];
      obj.context.batchGoodResponses = [];
      obj.context.trx = trx;
      return {
        didResolveSource() {},
        parsingDidStart() {},
        didEncounterErrors() {},
        willSendResponse(obj) {
          if (obj.context.batchResponses.length > 0) {
            for (let res in obj.response.data) {
              obj.response.data[res] = null;
            }
            obj.context.trx.rollback();
          } else {
            obj.context.trx.commit();
          }
         // console.log("batchResponses : " , obj.context.batchResponses)
        },
      };
    },
  },
];

const typeDefs = gql(readFileSync(`${__dirname}/core_cdm.graphql`, { encoding: 'utf-8' }));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

dbInit().then(() => {
  const server = new ApolloServer({
    schema: schema,
    context,
    dataSources,
    plugins,
    introspection: true
  });
  //server.applyMiddleware({app})
  server.listen({ port: process.env.PORT }, () =>
      console.log(`🚀 core cdm service ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
  );
});
