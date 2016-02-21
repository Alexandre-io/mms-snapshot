"use strict";

var cli = require('cli');
var moment = require('moment');

var MmsSnap = require('./mms-snapshot.js');

cli.parse({
	log: ['u', 'MMS Username', 'string'],
	key: ['p', 'MMS API Key', 'string'],
	group: ['g', 'MMS Group', 'string'],
	replicaSetName: ['r', 'MMS replicaSet', 'string'],
	verbose: ['v', 'Verbose mode', 'boolean', false],
	snapshots: ['s', 'Snapshot date', 'string', moment().utc().format("YYYY-MM-DD")],
	dest: ['d', 'Destination path', 'path', './']
});

cli.main(function(args, options) {
	var self = this;
	var mmsSnap = new MmsSnap(options.log, options.key, options.group, options.replicaSetName, options.snapshots, options.verbose, options.dest, function(err) {
		if (err) {
			return self.debug(err);
		}
		mmsSnap.exec(function(err, data) {
			if (err) {
				return self.debug(err);
			}
			if (options.verbose) {
				self.debug("Process exit: " + (+(!data)));
			}
			process.exit(+!data);
		});
	});
});