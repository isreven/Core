# portal-cf-graphql-cdm-core

[![Build Status](https://portalcfruntime.jaas-gcp.cloud.sap.corp/buildStatus/icon?job=ci-portal-cf-graphql-cdm-core-voter/master)](https://portalcfruntime.jaas-gcp.cloud.sap.corp/job/ci-portal-cf-graphql-cdm-core-voter/job/master/)

## Important message from DevOps:

**Welcome! for any new repository there are few further steps require in order to deliver its code to production.
Please notify devOps team once the code is ready in order to join the required step**

| Step | job | Status |
| ----- | ------ | :--------: |
| Initialization | create and restrict main branches master/rc/live | **Not Done** |
| Development | Create CI Pipeline | **Not Done** |
| Release | Copy from master to rc/live branches | **Not Done** |
| Internal Delivery | Deploy to (Dev/Nightly/CI-create-space) | **Not Done** |
| External Delivery | Deploy to val / validation /Internal production / Live | **Not Done** |

Please update on ongoing changes (updates in manifest-concourse.yml, changes in dependencies, etc )

## Important: Deploymnet sequence is not cover in the template
If you need to deploy your component, you must manually create and define the following files:

- **manifest-concourse.yml** that nees to reside in the root of your project, and describes the deployment information of the component.
- **.deployment/deployment.yml** this file descrube your components and its dependecies to other components in the product.
- **.deployment/portal-copy-config.yml** this file describes which aditional files needs to be copied from this repository to the product repository (for example, saas-registry.json)

## Description
< Please describe what the repository is aim for >
