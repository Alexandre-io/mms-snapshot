# MMS-snapshot [![Build Status](https://travis-ci.org/Alexandre-io/mms-snapshot.svg)](https://travis-ci.org/Alexandre-io/mms-snapshot) [![Codacy Badge](https://api.codacy.com/project/badge/grade/52a557b202ed4ca0a00a87bb4b492ac8)](https://www.codacy.com/app/alexandre_2/mms-snapshot) [![Greenkeeper badge](https://badges.greenkeeper.io/Alexandre-io/mms-snapshot.svg)](https://greenkeeper.io/)

Simple CLI to download snapshot from [MMS](https://mms.mongodb.com/).

### Setup
```sh
$ npm install -g mms-snapshot
```
### Usage

```
Usage: mms-snapshot [options]

Options:
  -u               MMS username 	(required)
  -p               MMS APIKey   	(required)
  -g               MMS Group name   (required)
  -r               MongoDB replset  (required)
  -d               Destination path (default: './')
  -s 			   Snapshot date   (default: today)
  -v 			   Verbose mode     (default: false)
  ```

### Usage example
```sh
$ mms-snapshot -u my@email.com -p xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx -g my-group -r my-replset -s 2015-08-01 -v true -d /home/
```