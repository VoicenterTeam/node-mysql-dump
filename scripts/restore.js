const { getArguments, getDBOptions, getDirPath } = require('./appEnv');

const { ElementLoader } = require('sql-smart-dump-lib');

const dumpOptions = getArguments();
const dbConnestionOptions = getDBOptions();

(async function () {
  const { sqlPath } = getDirPath();

  const loader = new ElementLoader(sqlPath, dbConnestionOptions);

  if (dumpOptions.db) {
    await loader.loadAllEvents(dumpOptions.db);
    await loader.loadAllRoutines(dumpOptions.db);
    await loader.loadAllTables(dumpOptions.db);
  } else {
    await loader.loadAllEvents();
    await loader.loadAllRoutines();
    await loader.loadAllTables();
  }
})();
