# Node MySQL dump

Apllication for dumping and restore data to database

## Envoirment

### .env example

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
CONNECTIONLIMIT=4
```

### Befor work you have to add .env file with that wariables

- `DB_HOST` - database host;
- `DB_USER` - database user;
- `DB_PASSWORD` - database password;
- `CONNECTIONLIMIT` - number of db connection in pool;

## Attributes

### To run scripts you can use three npm commands

- `npm run dump` - to create db dump and write it to files;
- `npm run cron -- --time "0 3 * * *"` - to create schedule for dumping database;
- `npm run restore`- to restore database from files;

Example: `npm run dump -- --git my_branch --db test_db --data`.

- `--` - to split arguments from command;
- `--git my_branch` - will use git for dumping database (app create new commit and push it to the remote git server);
- `--db test_db` - will dump or restore only one database from server;
- `--data` - will create dump tables with data;
- `--time "0 10 * * *"` - will create cron shedule at 10 am every day;
- `--full` - will dump full data base in one file;
- `--path "/home/username/dump-%m-%d-%Y-%H:%M:%S"` - path to dump file or dir (if it full dump it would be sql file);

Time examples:

- `--time "0 15 * * *"` - Cron will run every day at 3 pm.
- `--time "30 10 2 * *"` - Cron will run once a month on 2th at 10:30.

Path examples:

- `--path "sqlDump"` - will create `sqlDump` sql dump directory or file with sql extension if it's full dump;
- `--path "/home/dump-%m-%d-%Y-%H:%M:%S"` - will create dirictory or file with current date and time;

Date time paths:

- `%m` - month number;
- `%d` - day of month;
- `%Y` - year;
- `%H` - hours;
- `%M` - minutes;
- `%S` - seconds;

## PLEASE TAKE ATTENTION
>  To use `--full` option you mast have (or install) `mysqldump` or `mysql-client` package on your PC.
