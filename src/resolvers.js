const {
  updateServiceApiParameters,
  getFieldsOfQuery, paging, getFieldsOfQueryById} = require('./utils/util');

exports.resolvers = {
  Query: {
    WorkPage: async (_, args) => {
      return args;
    },

    Roles: async (_, { QueryInput = {} }, { dataSources }, info) => {
      const { skip = null, top = null } = QueryInput;
      const queryFieldsParameters = getFieldsOfQuery(info);
      updateServiceApiParameters(dataSources.subaccountLevelServiceAPI, queryFieldsParameters, dataSources.zoneId, skip, top);
      const roles = await dataSources.subaccountLevelServiceAPI.getRoles();
      return roles;
    },

    Visualizations: async (_, { SiteId, QueryInput = {} }, { dataSources }, info) => {
      console.log( "zoneId  " + dataSources.zoneId)
      const { skip = null, top = null, filter = null } = QueryInput;
      let vizs = [];
      let queryFieldsParameters = getFieldsOfQuery(info, 'Visualization');
      if (queryFieldsParameters.includes('Visualization.DescriptorRef')) {
        queryFieldsParameters = queryFieldsParameters.filter(queryFieldsParameter => {return queryFieldsParameter !== 'Visualization.DescriptorRef'});
        queryFieldsParameters.push('Visualization.BaseURL');
        queryFieldsParameters.push('Visualization.Path');
      }
      queryFieldsParameters = queryFieldsParameters.filter(param => param !== 'Visualization.Catalogs');
      queryFieldsParameters = queryFieldsParameters.filter(param => param !== 'Visualization.DescriptorRef');
      if (SiteId) { // Site Level
        updateServiceApiParameters(dataSources.siteLevelServiceAPI, queryFieldsParameters, dataSources.zoneId, skip, top, null, filter);
        vizs = await dataSources.siteLevelServiceAPI.getVisualizations(SiteId);
      } else { // Admin Level
        updateServiceApiParameters(dataSources.subaccountLevelServiceAPI, queryFieldsParameters, dataSources.zoneId, skip, top, null, filter);
        vizs = await dataSources.subaccountLevelServiceAPI.getVisualizations();
      }
      return vizs;
    },

    Visualization: async (_, { Id }, { dataSources }, info) => {
      if (!Id) {
        throw new Error("Visualization Id is missing");
      }
      let queryFieldsParameters = getFieldsOfQueryById(info, 'Visualization');
      if (queryFieldsParameters.includes('Visualization.DescriptorRef')) {
        queryFieldsParameters = queryFieldsParameters.filter(queryFieldsParameter => {return queryFieldsParameter !== 'Visualization.DescriptorRef'});
        queryFieldsParameters.push('Visualization.BaseURL');
        queryFieldsParameters.push('Visualization.Path');
      }
      queryFieldsParameters = queryFieldsParameters.filter(param => param !== 'Visualization.Catalogs');
      queryFieldsParameters = queryFieldsParameters.filter(param => param !== 'Visualization.DescriptorRef');
      updateServiceApiParameters(dataSources.subaccountLevelServiceAPI, queryFieldsParameters, dataSources.zoneId);
      const viz = await dataSources.subaccountLevelServiceAPI.getVisualization(Id);
      return viz;
    },

    getRolesOfSite: async (_, { SiteId }, { dataSources }) => {
      //Get all roles of site -> e.g ["sap_subaccount_everyone"]
      const roles = await dataSources.subaccountLevelServiceAPI.getRolesOfSite(SiteId);
      return roles;
    },

    Catalogs: async (_, { QueryInput = {} }, { dataSources }, info) => {
      const { skip = null, top = null } = QueryInput;
      const queryFieldsParameters = getFieldsOfQuery(info, 'Catalog');
      updateServiceApiParameters(dataSources.subaccountLevelServiceAPI, queryFieldsParameters, dataSources.zoneId, skip, top);
      const catalogs = await dataSources.subaccountLevelServiceAPI.getCatalogs();
      return catalogs;
    },
  },
  Visualization: {
    Descriptor: async (parent, { select, filter }, { dataSources }) => {
      const descriptor = await dataSources.descriptorDataLoader.load({ id: parent.Id, descriptor: parent.Descriptor, select, filter });
      return descriptor;
    },
    DescriptorRef: async (parent) => {
      const BaseURL = parent.BaseURL;
      const Path = parent.Path;
      return {BaseURL, Path};
    },
    Catalogs: async (parent, { QueryInput = {} }, { dataSources }) => {
      const { skip = 0, top = 10 } = QueryInput;
      let catalogs = await dataSources.catalogDataLoader.load({ id: parent.Id });
      catalogs = catalogs.splice(skip, top);
      return paging(catalogs, catalogs.length);
    }
  },
  Catalog: {
    Visualizations: async (parent, { QueryInput = {} }, { dataSources }, info) => {
      const { skip = 0, top = 10 } = QueryInput;
      let visualizations = await dataSources.visualizationDataLoader.load({ id: parent.Id, info});
      visualizations = visualizations.splice(skip, top);
      return paging(visualizations, visualizations.length);

    }
  },

  WorkPage: {
    UsedVisualizations: async (parent, { QueryInput = {}}, {dataSources}, info) => {
      const { skip = null, top = null } = QueryInput;
      const listOfVizsIds = parent.vizsIds;
      let queryFieldsParameters = getFieldsOfQuery(info, 'Visualization');
      if (queryFieldsParameters.includes('Visualization.DescriptorRef')) {
        queryFieldsParameters = queryFieldsParameters.filter(queryFieldsParameter => {return queryFieldsParameter !== 'Visualization.DescriptorRef'});
        queryFieldsParameters.push('Visualization.BaseURL');
        queryFieldsParameters.push('Visualization.Path');
      }
      updateServiceApiParameters(dataSources.subaccountLevelServiceAPI, queryFieldsParameters, dataSources.zoneId, skip, top);
      const viz = await dataSources.subaccountLevelServiceAPI.getVisualizationsByList(listOfVizsIds);
      return viz;
    }
  },
  Mutation: {
    assignRolesToSite: async (_, { SiteId, RolesIds }, { dataSources }, info) => {
      let queryFieldsParameters = getFieldsOfQuery(info);
      updateServiceApiParameters(dataSources.mutationServiceAPI, queryFieldsParameters, dataSources.zoneId);
      const roles = await dataSources.mutationServiceAPI.assignRolesToSite(SiteId, RolesIds);
      return roles;
    }
  }
};
