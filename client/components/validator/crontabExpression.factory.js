angular.module('managerApp').factory('CrontabExpression', () => {
  const cronMonths = '(?:JAN)|(?:FEB)|(?:MAR)|(?:APR)|(?:MAY)|(?:JUN)|(?:JUL)|(?:AUG)|(?:SEP)|(?:OCT)|(?:NOV)|(?:DEC)';
  const cronDays = '(?:MON)|(?:TUE)|(?:WED)|(?:THU)|(?:FRI)|(?:SAT)|(?:SUN)';

  return {
    minutesExpr: /^(?:(?:\*|[0-5]?\d(?!\/)|[0-5]?\d-[0-5]?\d)(?:\/[0-5]?\d|)(?:,(?!$)|$))+$/,
    hourExpr: /^(?:(?:\*|(?:[0-1]?\d|2[0-3])(?!\/)|(?:[0-1]?\d|2[0-3])-(?:[0-1]?\d|2[0-3]))(?:\/(?:[0-1]?\d|2[0-3])|)(?:,(?!$)|$))+$/,
    dayOfMonthExpr: /^(?:(?:\*|(?:[0-2]?\d|3[01])(?!\/)|(?:[0-2]?\d|3[01])-(?:[0-2]?\d|3[01]))(?:\/(?:[0-2]?\d|3[01])|)(?:,(?!$)|$))+$/,
    monthExpr: new RegExp(`^(?:(?:\\*|(?:0?\\d|1[0-2]|(?:${cronMonths}))(?!\\/)|(?:0?\\d|1[0-2]|(?:${cronMonths}))-(?:0?\\d|1[0-2]|(?:${cronMonths})))(?:\\/(?:0?\\d|1[0-2])|)(?:,(?!$)|$))+$`, 'i'),
    dayOfWeekExpr: new RegExp(`^(?:(?:\\*|(?:[0-7]|${cronDays})(?!\\/)|(?:[0-7]|${cronDays})-(?:[0-7]|${cronDays}))(?:\\/(?:[0-7])|)(?:,(?!$)|$))+$`, 'i'),
  };
});
