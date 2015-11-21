# bestofjs-batches v1

Scheduled tasks that generate static data used by bestof.js.org web application.

[![Build Status](https://semaphoreci.com/api/v1/projects/add14899-9368-4ae3-89df-21c09c9e0c36/548282/badge.svg)](https://semaphoreci.com/mikeair/bestofjs-batches)

## Strategy

* Use [semaphoreci.com](https://semaphoreci.com/) "build scheduler" feature to build a static JSON file every day.
* Use [divshot.io](https://divshot.com/) static hosting service to host the JSON file, requested by Ajax from the web application.

## Commands

`npm run batch-test` : run the test batch (a simple loop through the projects stored in the database)

`npm run daily`: script to be run every day, launched by the daily build process on the CI server.

`npm run github`: part 1 of the daily build: update Github data and take snapshots.

`npm run build`: part 2 of the daily build: create the json file from snapshots stored in the database.


## Command line parameters

The **first** parameter (required) is the name of the batch to launch

```
npm run <batch_key> [-- --param1 value1 --param2 value2]
```

Optional parameters:

* `--project <project_id>` process only the specified project, instead of all projects
* `--db <key>` connect to a database whose URL is specified in the .env file `MONGO_URI_<KEY>`
* `--readonly` run the batch in readonly mode, no database write (using Mongoose pre hooks, generate a lot of errors)
* `--debugmode` run the batch in debug mode, with more log printed
* `--limit <integer>` limit the project loop to n projects

Example:

```
npm run batch-test -- --project 55723c9f4140883353bc775c
```
