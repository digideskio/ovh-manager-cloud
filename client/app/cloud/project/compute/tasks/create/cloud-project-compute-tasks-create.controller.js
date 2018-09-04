angular.module("managerApp")
    .controller("CloudProjectComputeTasksCreateCtrl", class CloudProjectComputeTasksCreateCtrl {
        constructor ($q, $state, $stateParams, $translate, CloudMessage, CloudProjectCompute, OvhApiCloudProjectInstance, CPC_TASKS) {
            this.$q = $q;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
            this.CloudProjectCompute = CloudProjectCompute;
            this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
            this.CPC_TASKS = CPC_TASKS;
        }

        $onInit () {
            this.serviceName = this.$stateParams.projectId;
            this.instanceId = this.$stateParams.instanceId;
            this.instancesAreLoading = true;

            this.model = {
                action: null,
                instance: null,
                schedule: null
            };

            this.getRegionsWithWorkflowService();
        }

        getRegionsWithWorkflowService () {
            return this.CloudProjectCompute.getRegionsWithWorkflowService(this.serviceName)
                .then(regions => {
                    this.regions = regions;
                    return this.getCloudProjectEligibleInstances();
                })
                .catch(() => {
                    this.CloudMessage.error(this.$translate.instant("cpc_tasks_ressources_error"));
                });
        }

        getCloudProjectEligibleInstances () {
            return this.CloudProjectCompute.getInstances(this.serviceName)
                .then(instances => {
                    this.instances = _.filter(instances, instance => _.includes(this.regions, instance.region));
                    if (this.instanceId) {
                        this.model.instance = _.find(instances, { id: this.instanceId });
                    }
                })
                .catch(() => {
                    this.CloudMessage.error(this.$translate.instant("cpc_tasks_ressources_error"));
                })
                .finally(() => { this.instancesAreLoading = false; });
        }

        isActionSelected () {
            return !_.isNull(this.model.action);
        }

        isInstanceSelected () {
            return !_.isNull(this.model.instance);
        }

        isScheduleSelected () {
            return !_.isNull(this.model.schedule);
        }

        createTask () {
            if (this.model.action === "snapshot") {
                this.createSnapshotTask();
            }
        }

        selectSchedule () {
            this.isCustomSchedule = this.model.schedule === "custom";
        }

        generateTasksParams () {
            if (this.isCustomSchedule) {
                this.model.name = `${this.model.instance.name}-custom`;
            } else {
                this.model.name = `${this.model.instance.name}-daily`;
                this.model.rotation = _.get(this.CPC_TASKS, `defaultSchedules.${this.model.schedule}.rotation`);
                this.model.cron = `${this.model.minutes} ${this.model.hour} * * *`;
            }
        }

        createSnapshotTask () {
            this.creatingLoader = true;
            return this.CloudProjectCompute.createWorkflowBackup(this.serviceName, this.model.instance.region, {
                cron: this.model.cron,
                instanceId: this.model.instance.id,
                name: this.model.name,
                rotation: this.model.rotation
            })
                .then(() => {
                    this.goToTasksList();
                })
                .catch(error => {

                    this.CloudMessage.error(this.$translate.instant("cpc_tasks_create_error", { message: _.get(error, "data.message", "") }));
                })
                .finally(() => {
                    this.creatingLoader = false;
                });
        }

        goToTasksList () {
            this.$state.go("iaas.pci-project.compute.task");
        }
    });
