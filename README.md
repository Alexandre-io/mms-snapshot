# MMS-snapshoot [![Build Status](https://travis-ci.org/Alexandre-io/mms-snapshoot.svg)](https://travis-ci.org/Alexandre-io/mms-snapshoot) [![Codacy Badge](https://api.codacy.com/project/badge/grade/52a557b202ed4ca0a00a87bb4b492ac8)](https://www.codacy.com/app/alexandre_2/mms-snapshoot)

Simple CLI to download snapshoot from [MMS](https://mms.mongodb.com/).

### Setup
```sh
$ npm install -g mms-snapshoot
```
### Usage

```
Usage: mms-snapshoot [options]

Options:
  -u               MMS username 	(required)
  -p               MMS APIKey   	(required)
  -g               MMS Group name   (required)
  -r               MongoDB replset  (required)
  -d               Destination path (default: './')
  -s 			   Snapshoot date   (default: today)
  -v 			   Verbose mode     (default: false)
  ```

### Usage example
```sh
$ mms-snapshoot -u my@email.com -p xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx -g my-group -r my-replset -s 2015-08-01 -v true -d /home/
```