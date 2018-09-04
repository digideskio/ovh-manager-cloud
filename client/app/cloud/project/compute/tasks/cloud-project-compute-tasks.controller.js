angular.module("managerApp")
    .controller("CloudProjectComputeTasksCtrl", class CloudProjectComputeTasksCtrl {
        constructor ($q, $state, $stateParams, $translate, $uibModal, CloudMessage, CloudProjectCompute, CPC_TASKS) {
            this.$q = $q;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.$translate = $translate;
            this.$uibModal = $uibModal;
            this.CloudMessage = CloudMessage;
            this.CloudProjectCompute = CloudProjectCompute;
            this.CPC_TASKS = CPC_TASKS;
        }

        $onInit () {
            this.projectId = this.$stateParams.projectId;

            this.getRegionsWithWorkflowService();
        }

        getRegionsWithWorkflowService () {
            return this.CloudProjectCompute.getRegionsWithWorkflowService(this.projectId)
                .then(regions => {
                    this.regions = regions;
                    return this.getCloudInstancesBackup();
                })
                .catch(error => {
                    this.CloudMessage.error(this.$translate.instant("cpc_tasks_instances_error", { message: _.get(error, "data.message", "") }));
                });
        }

        getCloudInstancesBackup () {
            return this.$q.allSettled(_.map(this.regions, region => this.CloudProjectCompute.getWorkflowBackup(this.projectId, region)))
                .then(backups => {
                    this.backups = _.chain(backups).flatten().map(backup => _.set(backup, "action", "Snapshot")).value();
                })
                .catch(error => {
                    this.CloudMessage.error(this.$translate.instant("cpc_tasks_instances_error", { message: _.get(error, "data.message", "") }));
                });
        }

        getInstanceName (backup) {
            return this.CloudProjectCompute.getInstance(this.projectId, backup.instanceId)
                .then(instance => _.set(backup, "instanceName", instance.name))
                .catch(() => _.set(backup, "instanceName", this.$translate.instant("cpc_tasks_backups_instance_name_error")));
        }

        deleteTask ({ region, backupName }) {
            this.$uibModal.open({
                templateUrl: "app/cloud/project/compute/tasks/delete/cloud-project-compute-tasks-delete.html",
                controller: "CloudProjectComputeTasksDeleteCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => ({
                        projectId: this.projectId,
                        region,
                        backupName
                    })
                }
            })
                .result.then(() => {
                    this.backups = null;
                    this.getCloudInstancesBackup();
                });
        }
    });

