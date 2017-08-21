# bestofjs-batches

Scheduled tasks, run every day, that generate static data consumed by [bestof.js.org](https://bestof.js.org/) web application.

[![Build Status](https://semaphoreci.com/api/v1/projects/add14899-9368-4ae3-89df-21c09c9e0c36/548282/badge.svg)](https://semaphoreci.com/mikeair/bestofjs-batches)

## Strategy

* Use [semaphoreci.com](https://semaphoreci.com/) "build scheduler" feature to build a static JSON file every day.
* Use [firebase.com](https://www.firebase.com/) static hosting service to host the JSON file, requested by Ajax from the web application.

## Commands

### Main script

`npm run daily`: script to be run every day, launched by the daily build process on the CI server.

### Other commands

`node batches test` : run the test batch (a simple loop through the projects stored in the database)

`node batches github`: part 1 of the daily process: update Github data and take snapshots.

`node batches build`: part 2 of the daily process: create `projects.json` file from snapshots stored in the database.

`node batches hof`: part 3 of the daily process: update the Hall-of-Fame and build `hof.json` file


### Command line parameters

The **first** parameter (required) is the name of the batch to launch

```
node batches <batch_key>
```

Optional parameters:

* `--loglevel info|verbose|debug` specify the log level
* `--project <project_id>` process only the specified project, instead of all projects
* `--db <key>` connect to a database whose URL is specified in the .env file `MONGO_URI_<KEY>`
* `--readonly` run the batch in readonly mode, no database write (using Mongoose pre hooks, generate a lot of errors)
* `--debugmode` run the batch in debug mode, with more log printed
* `--limit <integer>` limit the project loop to n projects

Example:

```
node batches test --project 55723c9f4140883353bc775c
```
