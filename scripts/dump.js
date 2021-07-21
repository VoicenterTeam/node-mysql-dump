const { executeDump } = require('./helper');
const { getDBOptions, getArguments } = require('./appEnv');

const dumpOptions = getArguments();
const dbConnestionOptions = getDBOptions();

(async function () {
  await executeDump(dumpOptions, dbConnestionOptions);
})();
