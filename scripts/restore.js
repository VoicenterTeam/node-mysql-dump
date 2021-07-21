const fs = require('fs');
const { spawn } = require('child_process');

const { getArguments, getDBOptions, getDirPath, getFilePath } = require('./appEnv');

const { ElementLoader } = require('sql-smart-dump-lib');
const { getRedableSize } = require('./helper');

const dumpOptions = getArguments();
const dbConnestionOptions = getDBOptions();

async function fullRestore() {
  const sqlPath = getFilePath(dumpOptions);
  console.log('sqlPath', sqlPath);
  const readStream = fs.createReadStream(sqlPath);

  const restore = spawn('mysql', [
    `--host=127.0.0.1`,
    `--port=3306`,
    `--user=root`,
    `--password=123456`,
  ]);

  let dumpSize = 0;

  readStream.pipe(restore.stdin);

  readStream.on('data', function (data) {
    dumpSize += data.length;
    console.log(`Pipe data ${getRedableSize(dumpSize)}`);
  });

  readStream.on('exit', function (code) {
    console.log(`child process exited with code ${code.toString()}`);
  });
}

async function basicRestore() {
  const sqlPath = getDirPath(dumpOptions);
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
}

(async function () {
  if (dumpOptions.full) {
    await fullRestore();
  } else {
    await basicRestore();
  }
})();
