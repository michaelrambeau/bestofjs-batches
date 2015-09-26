# bestofjs-batches

Scheduled tasks that generate static data used by bestof.js.org web application.

[![Build Status](https://semaphoreci.com/api/v1/projects/add14899-9368-4ae3-89df-21c09c9e0c36/548282/badge.svg)](https://semaphoreci.com/mikeair/bestofjs-batches)

## Strategy

* Use [semaphoreci.com](https://semaphoreci.com/) "build scheduler" feature to build a static JSON file every day.
* Use [divshot.io](https://divshot.com/) static hosting service to host the JSON file, requested by Ajax from the web application.

## Commands

`npm run batch-test` : run the test batch (a simple loop through the projects stored in the database)

`npm run daily`: script to be run every day

`npm run snapshots`: part 1 of the daily build: take snapshots from Github.

`npm run build`: part 2 of the daily build: create the json file from snapshots stored in the database.
