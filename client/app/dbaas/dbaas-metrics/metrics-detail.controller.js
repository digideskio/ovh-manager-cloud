(() => {
  class MetricsDetailCtrl {
    constructor($filter, $q, $scope, $stateParams, CloudMessage, MetricService) {
      this.$filter = $filter;
      this.$q = $q;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.CloudMessage = CloudMessage;
      this.serviceName = $stateParams.serviceName;
      this.MetricService = MetricService;
      this.service = {};
      this.loadingService = false;
      this.messages = [];
    }

    $onInit() {
      this.loadData();
      this.loadMessage();
      this.$scope.$on('changeDescription', (event, data) => {
        this.service.description = data;
      });
    }

    loadData() {
      this.loadingService = true;
      this.MetricService.getService(this.serviceName)
        .then((service) => {
          this.service = service.data;
        })
        .finally(() => { this.loadingService = false; });
    }

    loadMessage() {
      this.CloudMessage.unSubscribe('dbaas.metrics.detail');
      this.messageHandler = this.CloudMessage.subscribe('dbaas.metrics.detail', { onMessage: () => this.refreshMessage() });
    }

    refreshMessage() {
      this.messages = this.messageHandler.getMessages();
    }
  }

  angular.module('managerApp').controller('MetricsDetailCtrl', MetricsDetailCtrl);
})();
