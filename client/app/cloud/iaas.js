/**
 *  Two main sections (IaaS and PaaS)
 */
angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('iaas', {
        url: '/iaas',
        abstract: true,
        template: '<ui-view/>',
        translations: ['../common', '.'],
      });
  });
