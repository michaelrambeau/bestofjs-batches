# Script to be run every time the project is built on SemaphoreCI
# https://semaphoreci.com/docs/available-environment-variables.html
# We want the script to be run either:
# - from the scheduler (every morning)
# - manually (if for some reason the automatic building process has failed)
# but not after every push to the `master` branch.
SOURCE="$SEMAPHORE_TRIGGER_SOURCE"
if [ "$SOURCE" == "scheduler" ] || [ "$SOURCE" == "manual" ] ; then
  echo "Launching the daily build..."
  npm run daily
else
  echo "No daily build script to launch."
fi
