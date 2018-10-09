angular.module('managerApp').service('NashaPartitionZFSOptionsService',
  function ($q, $filter, OvhApiDedicatedNasha, NASHA_ZFS_OPTIONS_DEFAULT) {
    const self = this;
    self.getZFSOptionsEnums = function () {
      return OvhApiDedicatedNasha.v6().schema().$promise
        .then((schema) => {
          const enums = {};
          enums.recordsize = _.chain(schema.models['dedicated.storage.RecordSizeEnum'].enum)
            .map((size) => {
              const int = parseInt(size, 10);
              return {
                size: int,
                label: $filter('bytes')(int, true),
                isDefault: int === NASHA_ZFS_OPTIONS_DEFAULT.recordsize,
              };
            })
            .sortBy('size')
            .value();

          enums.sync = _.map(schema.models['dedicated.storage.SyncEnum'].enum, option => ({
            label: option,
            warning: option === 'disabled',
            isDefault: option === 'standard',
          }));
          return enums;
        });
    };

    self.getCurrentZFSOptions = function (nashaId, partitionName) {
      const options = {
        atime: NASHA_ZFS_OPTIONS_DEFAULT.atime === 'on',
        recordsize: NASHA_ZFS_OPTIONS_DEFAULT.recordsize,
        sync: NASHA_ZFS_OPTIONS_DEFAULT.sync,
      };
      return OvhApiDedicatedNasha.Partition().Options().v6().get({
        serviceName: nashaId,
        partitionName,
      }).$promise
        .then((realOptions) => {
          options.atime = realOptions.atime === 'on';
          options.recordsize = parseInt(realOptions.recordsize, 10);
          options.sync = realOptions.sync;
          return options;
        })
        .catch((err) => {
          if (err.status === 404) {
            return $q.when(options);
          }
          return $q.reject(err);
        });
    };
  });
