angular.module('managerApp')
  .controller('CdaIpDeleteCtrl', function ($uibModalInstance, $translate, $stateParams, $scope, CloudMessage, OvhApiDedicatedCeph) {
    const self = this;

    self.ip = {};

    self.saving = false;

    function init() {
      self.ip = $scope.$resolve.items.ip;
    }

    self.closeModal = function () {
      $uibModalInstance.dismiss();
    };

    self.deleteIp = function () {
      self.saving = true;
      OvhApiDedicatedCeph.Acl().v6().delete({
        serviceName: $stateParams.serviceName,
        aclId: self.ip.id,
      }).$promise.then((result) => {
        $uibModalInstance.close({ taskId: result.data });
        CloudMessage.success($translate.instant('cda_ip_delete_success'));
      }).catch((error) => {
        CloudMessage.error([$translate.instant('ceph_common_error'), (error.data && error.data.message) || ''].join(' '));
      }).finally(() => {
        self.saving = false;
      });
    };

    init();
  });
