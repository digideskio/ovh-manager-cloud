angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('paas.veeam', {
      url: '/veeam',
      templateUrl: 'app/veeam/veeam.html',
      abstract: true,
      translations: ['../common', '.'],
    })
    .state('paas.veeam.detail', {
      url: '/{serviceName}',
      views: {
        veeamContainer: {
          templateUrl: 'app/veeam/veeam-detail.html',
          controller: 'VeeamDetailCtrl',
          controllerAs: 'VeeamDetailCtrl',
        },
      },
      translations: ['../common', '.'],
    })
    .state('paas.veeam.detail.dashboard', {
      url: '/dashboard',
      views: {
        veeamHeader: {
          templateUrl: 'app/veeam/header/veeam-dashboard-header.html',
          controller: 'VeeamDashboardHeaderCtrl',
          controllerAs: 'VeeamDashboardHeaderCtrl',
        },
        veeamContent: {
          templateUrl: 'app/veeam/dashboard/veeam-dashboard.html',
          controller: 'VeeamDashboardCtrl',
          controllerAs: '$ctrl',
        },
      },
      translations: ['../common', '.', './dashboard', './storage/add', './dashboard/update-offer'],
    })
    .state('paas.veeam.detail.storage', {
      url: '/storage',
      views: {
        veeamHeader: {
          templateUrl: 'app/veeam/header/veeam-dashboard-header.html',
          controller: 'VeeamDashboardHeaderCtrl',
          controllerAs: 'VeeamDashboardHeaderCtrl',
        },
        veeamContent: {
          templateUrl: 'app/veeam/storage/veeam-storage.html',
          controller: 'VeeamStorageCtrl',
          controllerAs: 'VeeamStorageCtrl',
        },
      },
      translations: ['../common', '.', './storage', './storage/add'],
    });
});
