class IpLoadBalancerServerFarmCtrl {
  constructor($filter, $state, $stateParams, $translate, ControllerHelper,
    IpLoadBalancerActionService, IpLoadBalancerServerService,
    IpLoadBalancerServerFarmService) {
    this.$filter = $filter;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.ControllerHelper = ControllerHelper;
    this.IpLoadBalancerActionService = IpLoadBalancerActionService;
    this.IpLoadBalancerServerService = IpLoadBalancerServerService;
    this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;

    this.serviceName = this.$stateParams.serviceName;

    this.initLoaders();
  }

  $onInit() {
    this.i18n = {
      preview: this.$translate.instant('common_preview_see'),
      update: this.$translate.instant('common_modify'),
      remove: this.$translate.instant('delete'),
    };

    this.init();
  }

  init() {
    this.farms.load();
  }

  initLoaders() {
    this.farms = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.IpLoadBalancerServerFarmService.getServerFarms(this.serviceName)
        .then((farms) => {
          this.createFarmActions(farms);
          return farms;
        }),
      successHandler: () => this.loadServers(),
    });
  }

  addServer(farm) {
    this.$state.go('network.iplb.detail.server-farm.server-add', {
      farmId: farm.id,
    });
  }

  loadServers() {
    _.forEach(this.farms.data, (farm) => {
      _.set(farm, 'servers', this.ControllerHelper.request.getArrayLoader({
        loaderFunction: () => this.IpLoadBalancerServerFarmService
          .getServerFarmServers(this.serviceName, farm.farmId, farm.type),
      }));
      farm.servers.load();
    });
  }

  seeServerPreview(server) {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/iplb/server/preview/iplb-server-preview.html',
        controller: 'IpLoadBalancerServerPreviewCtrl',
        controllerAs: 'IpLoadBalancerServerPreviewCtrl',
        resolve: {
          server: () => server,
        },
      },
    });
  }

  seeServerStatus(server) {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/iplb/server/status/iplb-server-status-detail.html',
        controller: 'IpLoadBalancerServerStatusDetailCtrl',
        controllerAs: 'IpLoadBalancerServerStatusDetailCtrl',
        resolve: {
          server: () => server,
        },
      },
    });
  }

  deleteServer(farm, server) {
    this.IpLoadBalancerActionService.deleteServer(
      this.$stateParams.serviceName,
      farm,
      server,
    ).then(() => this.init());
  }

  farmPreview(farm) {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/iplb/serverFarm/preview/iplb-server-farm-preview.html',
        controller: 'IpLoadBalancerServerFarmPreviewCtrl',
        controllerAs: 'IpLoadBalancerServerFarmPreviewCtrl',
        resolve: {
          farm: () => farm,
        },
      },
    });
  }

  update(farm) {
    this.$state.go('network.iplb.detail.server-farm.update', {
      serviceName: this.$stateParams.serviceName,
      farmId: farm.farmId,
    });
  }

  updateServer(farmId, serverId) {
    this.$state.go('network.iplb.detail.server-farm.server-update', {
      farmId,
      serverId,
    });
  }

  delete(farm) {
    this.IpLoadBalancerActionService.deleteFarm(
      this.$stateParams.serviceName,
      farm,
    ).then(() => this.init());
  }

  toggle(farm, server) {
    const newStatus = server.status === 'active' ? 'inactive' : 'active';
    this.IpLoadBalancerServerService.update(
      farm.type,
      this.$stateParams.serviceName,
      farm.farmId,
      server.serverId, {
        status: newStatus,
      },
    ).then(() => {
      // Apply value on model
      _.set(server, 'status', newStatus);
    });
  }

  createFarmActions(farms) {
    this.farmActions = {};
    farms.forEach((farm) => {
      this.farmActions[farm.farmId] = [
        [{
          text: this.i18n.preview,
          callback: () => this.farmPreview(farm),
        }],
        [{
          text: this.i18n.update,
          callback: () => this.update(farm),
        }, {
          text: this.i18n.remove,
          callback: () => this.delete(farm),
        }],
      ];
    });
  }

  getFarmText(farm) {
    let serverText = '';
    if (!_.get(farm.servers, 'loading', false)) {
      const serverNumber = farm.servers.data.length;
      const serverLabel = serverNumber > 1
        ? this.$translate.instant('iplb_farm_list_accordion_aside_server_many', { serverNumber })
        : this.$translate.instant('iplb_farm_list_accordion_aside_server_single', { serverNumber });
      serverText = ` / ${this.$translate.instant(serverLabel, { serverNumber })}`;
    }

    let zone = farm.zoneText.microRegion.text;
    if (farm.zone === 'all') {
      zone = this.$translate.instant('iplb_zone_all');
    }

    return `${this.$filter('uppercase')(farm.type) + (farm.port ? `:${farm.port}` : '')} / ${zone}${serverText}`;
  }

  getFarmName(farm) {
    if (!farm.displayName) {
      return this.$translate.instant('iplb_farm_list_accordion_title', {
        farmId: farm.farmId,
      });
    }

    return `${farm.displayName} (${farm.farmId})`;
  }
}

angular.module('managerApp').controller('IpLoadBalancerServerFarmCtrl', IpLoadBalancerServerFarmCtrl);
