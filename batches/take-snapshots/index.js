// DAILY BUILD PART 1
// Steps:
// - Loop through all projects
// - Get the last snapshot record saved in the database
// IF it is not today's snapshot =>
//   - get the stars count from Github
//   - save a "snapshot" record in the database
