const fs = require('fs');
const { spawn } = require('child_process');

const simpleGit = require('simple-git/promise');
const moment = require('moment');
const { EventDumper, RoutineDumper, TableDumper } = require('sql-smart-dump-lib');

const { consoleColor, getFilePath, getDirPath } = require('./appEnv');

const KByte = 10 ** 3;
const MByte = 10 ** 6;
const GByte = 10 ** 9;

function createSqlDirIfNotExist (sqlPath) {
  if (!fs.existsSync(sqlPath)) fs.mkdirSync(sqlPath, { recursive: true });
}

function getGit(dumpOptions, sqlPath) {
  if (typeof dumpOptions.git !== 'string') return undefined;

  return simpleGit(`${sqlPath}/../`);
}

async function commitChanges(git, dumpOptions) {
  if (await git.checkIsRepo('root')) {
    console.log(consoleColor, 'Start commiting');

    await git.add('./sqlDump/*');
    await git.commit(`Save dump on ${moment().format('YYYY-MM-DD')}`);
    await git.push('origin', dumpOptions.git);

    console.log(consoleColor, 'End commiting');
  }
}

async function dumpEvents(sqlPath, dbConnestionOptions, dbName) {
  const eventDump = new EventDumper(sqlPath, dbConnestionOptions);

  if (dbName) {
    await eventDump.saveAllEvents(dbName);
  } else {
    await eventDump.saveAllEvents();
  }
}

async function dumpRoutines(sqlPath, dbConnestionOptions, dbName) {
  const routineDump = new RoutineDumper(sqlPath, dbConnestionOptions);

  if (dbName) {
    await routineDump.saveAllRoutines(dbName);
  } else {
    await routineDump.saveAllRoutines();
  }
}

async function dumpTables(sqlPath, dbConnestionOptions, dbName) {
  const tableDump = new TableDumper(sqlPath, dbConnestionOptions);

  if (dbName) {
    await tableDump.saveAllTables(dbName);
  } else {
    await tableDump.saveAllTables();
  }
}

async function dumpTablesWithData(sqlPath, dbConnestionOptions, dbName) {
  const tableDump = new TableDumper(sqlPath, dbConnestionOptions);

  if (dbName) {
    await tableDump.saveAllTablesWithData(dbName);
  } else {
    await tableDump.saveAllTablesWithData();
  }
}

function getRedableSize(bytes) {
  if (bytes > GByte) {
    return `${(bytes / GByte).toFixed(2)} GB`;
  } else if (bytes > MByte) {
    return `${(bytes / MByte).toFixed(2)} MB`;
  } else if (bytes > KByte) {
    return `${(bytes / KByte).toFixed(2)} KB`;
  }

  return `${bytes} B`;
}

async function fullDump (dumpOptions, dbConnestionOptions) {
  try {
    const dumpFilePath = getFilePath(dumpOptions);

    const writeStream = fs.createWriteStream(dumpFilePath);

    const dump = spawn('mysqldump', [
      `--host=${dbConnestionOptions.host}`,
      `--port=3306`,
      `--user=${dbConnestionOptions.user}`,
      `--password=${dbConnestionOptions.password}`,
      '--all-databases',
      '--ignore-table=mysql.innodb_index_stats',
      '--ignore-table=mysql.innodb_table_stats',
      '--lock-tables=false',
      '--routines',
    ]);

    let dumpSize = 0;

    dump.stdout.on('data', function (data) {
      dumpSize += data.length;
      console.log(`Pipe data ${getRedableSize(dumpSize)}`);
    });

    dump.stdout.pipe(writeStream);

    dump.on('exit', function (code) {
      console.log(`child process exited with code ${code.toString()}`);
    });
  } catch (error) {
    console.error(error);
  }
}

async function dumpDB (dumpOptions, dbConnestionOptions) {
  try {
    const sqlPath = getDirPath(dumpOptions);

    createSqlDirIfNotExist(sqlPath);

    const git = getGit(dumpOptions, sqlPath);

    const dbName = typeof dumpOptions.db === 'string' ? dumpOptions.db : undefined;

    console.log(consoleColor, 'Start dumping');

    await dumpEvents(sqlPath, dbConnestionOptions, dbName);
    await dumpRoutines(sqlPath, dbConnestionOptions, dbName);

    if (dumpOptions.data) {
      await dumpTablesWithData(sqlPath, dbConnestionOptions, dbName);
    } else {
      await dumpTables(sqlPath, dbConnestionOptions, dbName);
    }

    console.log(consoleColor, 'End dumping');

    if (git) {
      await commitChanges(git, dumpOptions);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports.getRedableSize = getRedableSize;

module.exports.executeDump = async function (dumpOptions, dbConnestionOptions) {
  if (dumpOptions.full) {
    await fullDump(dumpOptions, dbConnestionOptions);
  } else {
    await dumpDB(dumpOptions, dbConnestionOptions);
  }
}
