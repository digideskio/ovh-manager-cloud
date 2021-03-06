angular.module('managerApp').service('VpsNotificationIpv6', ['$q', 'ovhUserPref', function VpsNotificationIpv6($q, ovhUserPref) {
  const self = this;

  function createNotificationUserPref(userPrefName, subject) {
    return ovhUserPref.create(userPrefName, [subject]);
  }

  self.stopNotification = function stopNotification(userPrefName, subject) {
    let notificationArray = [];
    return ovhUserPref.getValue(userPrefName).then((data) => {
      notificationArray = data;

      notificationArray.push(subject);
      return ovhUserPref.assign(userPrefName, notificationArray);
    }).catch(error => (error.status === 404
      ? createNotificationUserPref(userPrefName, subject)
      : $q.reject(error)));
  };

  self.checkIfStopNotification = function checkIfStopNotification(userPrefName, isArray, subject) {
    return ovhUserPref
      .getValue(userPrefName)
      .then(notification => (isArray
        ? _.indexOf(notification, subject) !== -1
        : notification))
      .catch(() => false);
  };
}]);
