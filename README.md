This command will download a snapshoot created on [MMS](https://mms.mongodb.com/).

### Setup
```sh
$ npm install -g mms-snapshoot
```
### Usage

```
Usage: mms-snapshoot [options] [path]

Options:
  -u               MMS username 	(required)
  -p               MMS APIKey   	(required)
  -g               MMS Group name   (required)
  -r               MongoDB replset  (required)
  -s 			   Snapshoot date   (default: today)
  -v 			   Verbose mode     (default: false)
  ```

### Usage example
```sh
$ mms-snapshoot -u my@email.com -p xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx -g my-group -r my-replset -s 2015-08-01 -v true
```