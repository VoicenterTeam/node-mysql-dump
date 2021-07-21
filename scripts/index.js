const { dumpDB } = require('./helper');
const { getArguments, getDirPath, getDBOptions } = require('./appEnv');

const dumpOptions = getArguments();
const dbConnestionOptions = getDBOptions();

(async function () {
  console.log(getDirPath(dumpOptions));
})();