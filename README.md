# Coverage service

> Create coverage report from `window.__coverage__` object

[![Coverage Status](https://coveralls.io/repos/github/miloss/coverage-service/badge.svg?branch=master)](https://coveralls.io/github/miloss/coverage-service?branch=master)

# API


## Get info

Get info from currently uploaded coverage objects.

**URL:** `/api/info`

**Method:** `GET`

**Success response:**

Code: 200
```json
[
  {
    "no": 1,
    "version": "6.42.0",
    "type": "dist",
    "gitHash": "35df47ca4e100ad5ce8d1ef25cb7a9ee5482",
    "sessionCnt": 12,
    "size": 44409338,
    "sizeDisplay": "42.4 MB",
    "updated": "2017-12-05T18:51:05.000Z"
  }
]
```

**Example call:**

```bash
curl -X GET http://localhost:9000/api/info
```

## Get progress info

Get more details about code coverage and difference between versions.

**URL:** `/api/info/progress`

**Method:** `GET`

**Success response:**

Code: 200
```json
[
  {
    "gitHash": "35df47ca4e100ad5ce8d1ef25cb7a9ee5482",
    "Stmts": {
      "value": 47.74,
      "diff": 1.7
    },
    "Branch": {
      "value": 32.26,
      "diff": 2.76
    },
    "Funcs": {
      "value": 38.62,
      "diff": 0.14
    },
    "Lines": {
      "value": 48.22,
      "diff": 1.52
    }
  }
]
```

**Example call:**

```bash
curl -X GET http://localhost:9000/api/info/progress
```


## Post version object

Post `version.json` object as payload, to report new version.

**URL:** `/api/version`

**Method:** `POST`

**Payload data:** _`version.json` object_

**Success response:**

Code: 200
```json
{
  "build": 1512130791063,
  "version": "6.42.0",
  "type": "dist",
  "desc": "Production Build",
  "gitHash": "35df47ca4e100ad5ce8d1ef25cb7a9ee5482"
}
```

**Example call:**

POST content of `version.json` file:
```bash
curl -X POST http://localhost:9000/api/version -d @version.json --header "Content-Type: application/json"
```

# Coverage

## Post coverage object

Post `window.__coverage__` object as payload. Subsequent requests append to already
saved coverage.

**URL:** `/api/coverage/:hash`

**Method:** `POST`

**Payload data:** _`window.__coverage__` object_

**Success response:**

Code: 200
```json
{
  "content-length": 10485760
}
```

**Error response:**

Code: 500
```
Error: Something went wrong
```

**Example call:**

```bash
curl -X POST http://localhost:9000/api/coverage/1fbd5f2220ef -d @coverage.json --header "Content-Type: application/json"
```



## Get coverage report (plain text)

From currently uploaded coverage objects.

**URL:** `/api/coverage/:hash`

**Method:** `GET`

**Success response:**

Code: 200
```
--------------------------|----------|----------|----------|----------|----------------|
File                      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------------|----------|----------|----------|----------|----------------|
All files                 |    46.98 |    29.31 |    37.94 |    45.96 |                |
...                       |          |          |          |          |                |
```

**Error response:**

Code: 404
```
Coverage object not found
```

Code: 500
```
Error generating report
```

**Example call:**

```bash
curl -X GET http://localhost:9000/api/coverage/1fbd5f2220ef
```

## Generate coverage report (HTML)

Generate a HTML report. Checkout git repository at specific commit in the process.

**URL:** `/api/coverage/html/:hash`

**Method:** `GET`

**Success response:**

Code: 200
```
/html/35df47ca4e100ad5ce8d1ef25cb7a9ee5482
```

HTML report is visible at http://localhost:9000/html/35df47ca4e100ad5ce8d1ef25cb7a9ee5482

**Example call:**

```bash
curl -X GET http://localhost:9000/api/coverage/html/1fbd5f2220ef
```


# Git

## Clone git repository

_Slow_. Needed to generate HTML report. It might take several minutes, depending on repo size.

**URL:** `/api/git`

**Method:** `POST`

**Success response:**

Code: 200
```
Cloning into 'repo'...
remote: Counting objects: 649650, done.
remote: Compressing objects: 100% (294425/294425), done.
...
```

**Error response:**

Code: 409
```
Repository already exists
```

**Example call:**

```bash
curl -X POST http://localhost:9000/api/git
```


## Clear cloned repository

**URL:** `/api/git`

**Method:** `DELETE`

**Success response:**

Code: 200
```
OK
```

**Error response:**

Code: 404
```json
Repository not found
```

**Example call:**

```bash
curl -X DELETE http://localhost:9000/api/git
```


# Setup

```bash
npm install
```

## Run

```bash
npm run start
```

## Environment variables

### `PORT`
(Number)

HTTP port number to use. Default: 9000

### `PAYLOAD_LIMIT`
(String)

Maximum payload size allowed. Default: `50MB`

### `REPO`
(String)

Git remote repository. Default: `git@git.url:repo.git`

### `REPO_BRANCH`
(String)

Git repository branch. Default: `master`

### `DATA_DIR`
(String)

Location on disk where to store temporary working data (checked-out repository,
coverage objects, and generated HTML reports). Default: `__dirname/data`
