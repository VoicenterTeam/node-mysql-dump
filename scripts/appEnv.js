require('dotenv').config();
const path = require('path');

module.exports.consoleColor = '\x1b[36m%s\x1b[0m';

module.exports.getArguments = function () {
  let prevKey = '';

  return [...process.argv].splice(2).reduce((res, argument) => {
    if (argument.indexOf('--') === 0) {
      prevKey = argument.replace('--', '');
      res[prevKey] = true;
    } else if (prevKey && prevKey === 'path') {
      res[prevKey] = generatePath(argument);
    } else if (prevKey) {
      res[prevKey] = parseArgument(argument);
    }
    return res;
  }, {});
}

function parseArgument(argument) {
  argument = argument.toLowerCase();
  if (argument === 'true' || argument === 'false') {
    return JSON.parse(argument);
  } else {
    return argument;
  }
}

module.exports.getFilePath = function (dumpOptions) {
  let dumpPath = dumpOptions.path || 'dump.sql';
  if (!/.sql$/.test(dumpPath)) dumpPath += '.sql';
  return dumpPath;
}

module.exports.getDirPath = function (dumpOptions) {
  return dumpOptions.path?.replace(/.sql$/, '') || 'sqlDump';
}

module.exports.getDBOptions = function () {
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.CONNECTIONLIMIT),
  };
}

function generatePath (fileName) {
  const now = new Date();
  const replaces = [
    { sign: '%m', datePart: now.getMonth() + 1 },
    { sign: '%d', datePart: now.getDate() },
    { sign: '%Y', datePart: now.getFullYear() },
    { sign: '%H', datePart: now.getHours() },
    { sign: '%M', datePart: now.getMinutes() },
    { sign: '%S', datePart: now.getSeconds() },
  ];
  replaces.forEach((dateSign) => {
    fileName = fileName.replace(dateSign.sign, dateSign.datePart);
  });

  return fileName;
}
