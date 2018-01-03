# `risingstars` batch

Script used to generate data consumed by "JavaScript Rising Stars" application.

Adjust the variable `year` from `index.js` to target a given year.

```
node batches risingstars --loglevel debug
```

```json
{
  "date": "2018-01-03T08:48:38.817Z",
  "count": 1,
  "projects": [
    {
      "name": "RiotJS",
      "url": "http://riotjs.com",
      "full_name": "riot/riot",
      "description": "Simple and elegant component-based UI library",
      "owner_id": 12729373,
      "tags": ["framework", "vdom"],
      "delta": 1389,
      "stars": 12659,
      "created_at": "2013-09-27T05:21:01.000Z",
      "monthly": [86, 62, 83, 125, 117, 91, 112, 138, 153, 138, 149, 135]
    }
  ]
}
```
