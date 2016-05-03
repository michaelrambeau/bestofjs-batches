# Hall of Fame daily batch

How to launch it from the command line:

```
node batches hof --debugmode --limit 10
```

Steps

* Loop through all Hall of fame records (`Hero` model)
* Call Github API, using Github `login` as a key, to get fresh data:
  * `name`
  * `avatar_url`
  * `followers`
* Update the database documents if needed  
* Write the JSON file

Example of Github API call: https://api.github.com/users/sindresorhus
