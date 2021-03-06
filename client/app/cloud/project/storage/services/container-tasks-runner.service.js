/* eslint-disable no-param-reassign, prefer-destructuring, consistent-return */
angular.module('managerApp').service('CloudStorageContainerTasksRunner', [
  '$q',
  '$rootScope',
  function CloudStorageContainerTasksRunner($q, $rootScope) {
    const defaultQueueName = 'main';
    let taskQueues = {};

    const self = this;

    self.limit = 4;

    /**
     * Flush tasks.
     */
    self.flush = function () {
      taskQueues = {};
    };

    /**
     * Get queue list.
     * @return {Array} queue list
     */
    self.getQueues = function () {
      return taskQueues;
    };

    /**
     * Count number of running tasks.
     * @return {number} number of running tasks
     */
    self.countRunningTasks = function () {
      return self.countTasks('running');
    };

    /**
     * Count total number of tasks.
     * @return {number} total number of tasks
     */
    self.countTotalTasks = function () {
      return self.countTasks('total');
    };

    /**
     * Count number of pending tasks.
     * @return {number} number of pending tasks
     */
    self.countPendingTasks = function () {
      return self.countTotalTasks() - self.countDoneTasks() - self.countErrorTasks();
    };

    /**
     * Count number of done tasks.
     * @return {number} number of done tasks
     */
    self.countDoneTasks = function () {
      return self.countTasks('success');
    };

    /**
     * Count tasks in error.
     * @return {number} number of tasks in error
     */
    self.countErrorTasks = function () {
      return self.countTasks('error');
    };

    /**
     * Count number of tasks in a specific state.
     * @params {...string} states to count
     * @return {number} number of tasks in theses states
     */
    self.countTasks = function () {
      const states = arguments; // eslint-disable-line
      return _.chain(_.values(taskQueues))
        .reduce((result, queue) => {
          const currentSum = _.chain(queue).pick(states).sum().value();
          return result + currentSum;
        }, 0)
        .value();
    };

    /**
     * Add task to a queue.
     * @param  {string}    queueName  Queue name (optional, default: "main")
     * @param  {Function}  task       List of functions returning promises
     * @return {Promise} the promise for all this task queue
     */
    self.addTask = function (queueName, task) {
      if (!task) {
        task = queueName;
        queueName = defaultQueueName;
      }

      this.enqueue(queueName, [task]);

      const queue = taskQueues[queueName];

      return queue.defer.promise;
    };

    function decorateTask(task) {
      return $q.when()
        .then(() => {
          $rootScope.$broadcast('cloudStorageContainerTasksRunner:start_task');
          return task();
        })
        .then((result) => {
          $rootScope.$broadcast('cloudStorageContainerTasksRunner:finish_task', {
            status: 'success',
            payload: result,
          });
          return result;
        })
        .catch((error) => {
          $rootScope.$broadcast('cloudStorageContainerTasksRunner:finish_task', {
            status: 'error',
            payload: error,
          });
          return $q.reject(error);
        });
    }

    /**
     * Create controlled tasks queue.
     * @param  {string}           queueName   Queue name (optional, default: "main")
     * @param  {Array<Function>}  tasks       List of functions returning promises
     * @param  {number}           limit       Concurrency limit (default: 3)
     * @return {Promise} the promise for all this task queue
     */
    self.enqueue = function (queueName, tasks, limit) {
      if (_.isArray(queueName)) {
        tasks = queueName;
        limit = tasks;
        queueName = defaultQueueName;
        if (!_.isNumber(limit)) {
          limit = self.limit;
        }
      }

      const defer = $q.defer();

      function next(queue) {
        if (!queue.remainingTasks.length && queue.running === 0) {
          return queue.defer.resolve({
            success: queue.successOutput,
            error: queue.errorOutput,
          });
        }

        while (queue.remainingTasks.length > 0 && queue.running < queue.limit) {
          const task = queue.remainingTasks.shift();
          queue.running += 1;
          decorateTask(task)
            .then((data) => {
              queue.successOutput.push(data);
              queue.success += 1;
            })
            .catch((err) => {
              queue.errorOutput.push(err);
              queue.error += 1;
            })
            .finally(() => {
              queue.running -= 1;
              queue.defer.notify(queue);
              next(queue);
            }); // jshint ignore:line
        }
      }

      let queue = taskQueues[queueName];

      if (queue && !queue.remainingTasks.length && queue.running === 0) {
        self.flush();
        queue = null;
      }

      if (!queue) {
        queue = {
          name: queueName,
          limit: limit || self.limit,
          running: 0,
          success: 0,
          error: 0,
          defer,
          remainingTasks: tasks,
          total: tasks.length,
          successOutput: [],
          errorOutput: [],
        };
        taskQueues[queueName] = queue;
        next(queue);
      } else {
        queue.remainingTasks = queue.remainingTasks.concat(tasks);
        queue.total += tasks.length;
      }

      return defer.promise;
    };
  }]);
/* eslint-enable no-param-reassign, prefer-destructuring, consistent-return */
