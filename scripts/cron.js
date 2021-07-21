const cron = require('node-cron');

const { executeDump } = require('./helper');
const { getDBOptions, getArguments } = require('./appEnv');

const dumpOptions = getArguments();
const dbConnestionOptions = getDBOptions();

if (dumpOptions.time) {
  cron.schedule(dumpOptions.time, async function () {
    await executeDump(dumpOptions, dbConnestionOptions);
  });
}
