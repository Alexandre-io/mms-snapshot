"use strict";

var request = require('request');
var fs = require('fs');
var crypto = require('crypto');
var moment = require('moment');

var config = require('../config/mms.js');
var _ = require('lodash');

// constructor
function MmsSnap(log, key, group, replicaSetName, snapshots, verbose, dest, cb) {
	this.log = log;
	this.key = key;
	this.group = group;
	this.replicaSetName = replicaSetName;
	this.snapshots = snapshots;
	this.verbose = verbose;
	this.dest = dest;
	this.conf = {
		headers: config.headers,
		auth: {
			'user': this.log,
			'pass': this.key,
			'sendImmediately': false
		}
	};
	this.groupId = null;
	this.clusterId = null;

	if (!moment(this.snapshots, "YYYY-MM-DD").isValid()) {
		return cb(new Error("Invalid snapshot date"));
	}

	var self = this;
	self.getGroupDetails(function(err, group) {
		if (err) {
			return cb(err);
		}
		self.setGroupId(group.id);
		self.getClusterDetails(group.id, function(err, cluster) {
			if (err) {
				return cb(err);
			}
			self.setClusterId(cluster.id);
			return cb(null);
		});
	});
}

// Setter groupid
MmsSnap.prototype.setGroupId = function(id) {
	this.groupId = id;
	if (this.verbose) {
		console.log("Get GroupId: " + id);
	}
};

// Setter clusterid
MmsSnap.prototype.setClusterId = function(id) {
	this.clusterId = id;
	if (this.verbose) {
		console.log("Get ClusterId: " + id);
	}
};

// Get group
MmsSnap.prototype.getGroupDetails = function(cb) {
	var self = this;
	request(config.mms.url + '/groups', self.conf, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var rslt = JSON.parse(body);
			rslt = _.where(rslt.results, {
				name: self.group
			});
			if (rslt && rslt[0] && rslt[0]) {
				return cb(null, rslt[0]);
			}
		}
		return cb(error);
	});
};

// Get cluster
MmsSnap.prototype.getClusterDetails = function(groupId, cb) {
	var self = this;
	request(config.mms.url + '/groups/' + groupId + '/clusters', self.conf, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var rslt = JSON.parse(body);
			rslt = _.where(rslt.results, {
				replicaSetName: self.replicaSetName
			});
			if (rslt && rslt[0] && rslt[0]) {
				return cb(null, rslt[0]);
			}
		}
		return cb(error);
	});
};

// exec
MmsSnap.prototype.exec = function(cb) {
	var self = this;
	self.getSnapshootList(function(err, snap) {
		if (err) {
			return cb(err);
		}
		if (!snap.complete) {
			return cb(new Error("Backup incomplete"));
		}
		if (self.verbose) {
			console.log("Found Snapshot: " + snap.id + " created at " + snap.created.date);
		}
		self.createRestoreJob(snap.id, function(err, rjob) {
			if (err) {
				return cb(err);
			}
			if (self.verbose) {
				console.log("Create JobId: " + rjob.id);
			}
			self.getSnapshoot(rjob.id, function(err, sUrl) {
				if (err) {
					return cb(err);
				}
				if (self.verbose) {
					console.log("Download Url: " + sUrl.url);
				}
				self.download(sUrl.url, function(err, file) {
					if (err) {
						return cb(err);
					}
					if (self.verbose) {
						console.log("Get File: " + file);
					}
					self.checkSum(rjob.id, file, function(err, checkc) {
						if (err) {
							return cb(err);
						}
						if (self.verbose) {
							console.log("Checksum SHA1 validity: " + checkc);
						}
						return cb(null, checkc);
					});
				});
			});
		});
	});
};

MmsSnap.prototype.getSnapshootList = function(cb) {
	var self = this;
	request(config.mms.url + '/groups/' + self.groupId + '/clusters/' + self.clusterId + '/snapshots', self.conf, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var rslt = JSON.parse(body);

			var rtn = _.find(rslt.results, function(sn) {
				return sn.created.date.indexOf(self.snapshots) === 0;
			});

			if (rtn) {
				return cb(null, rtn);
			}
			else {
				return cb(new Error("Snapshot not found."));
			}
		}
		return cb(error);
	});
};

MmsSnap.prototype.createRestoreJob = function(snapId, cb) {
	var self = this;
	request({
			method: 'POST',
			headers: self.conf.headers,
			auth: self.conf.auth,
			url: config.mms.url + '/groups/' + self.groupId + '/clusters/' + self.clusterId + '/restoreJobs',
			body: JSON.stringify({
				"snapshotId": "" + snapId
			})
		},
		function(error, response, body) {
			if (!error && response.statusCode === 200) {
				var rslt = JSON.parse(body);
				if (rslt.results) {
					return cb(null, rslt.results[0]);
				}
			}
			return cb(error);
		});
};

MmsSnap.prototype.getSnapshoot = function(restoreId, cb) {
	var self = this;
	request(config.mms.url + '/groups/' + self.groupId + '/clusters/' + self.clusterId + '/restoreJobs/' + restoreId, self.conf, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var rslt = JSON.parse(body);
			if (rslt.delivery && rslt.delivery.statusName && rslt.delivery.statusName === 'READY') {
				cb(null, rslt.delivery);
			}
			else if (rslt.delivery && rslt.delivery.statusName) {
				setTimeout(function() {
					console.log("waiting url...");
					self.getSnapshoot(restoreId, cb);
				}, config.checkTimeout);
			}
			else {
				return cb(new Error("Wrong snapshot"));
			}
		}
		else {
			return cb(error);
		}
	});
};

MmsSnap.prototype.download = function(url, cb) {
	var self = this;
	var req = request(url, self.conf);

	var surl = url.split('/');
	var filename = surl[surl.length - 1];

	var f = self.dest + filename;

	var file = fs.createWriteStream(f);

	req.on('data', function(data) {

	}).pipe(file);

	req.on('end', function(data) {
		return cb(null, f);
	});

	req.on('error', cb);
};

MmsSnap.prototype.checkSum = function(restoreId, file, cb) {
	var self = this;
	request(config.mms.url + '/groups/' + self.groupId + '/clusters/' + self.clusterId + '/restoreJobs/' + restoreId, self.conf, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var rslt = JSON.parse(body);
			if (rslt && rslt.hashes && rslt.hashes[0].hash) {
				// Checksum
				var hashWanted = rslt.hashes[0].hash;

				var fd = fs.createReadStream(file);
				var hash = crypto.createHash('sha1');
				hash.setEncoding('hex');

				fd.on('end', function() {
					hash.end();
					return cb(null, String(hash.read()) === String(hashWanted));
				});

				fd.pipe(hash);

			}
			else {
				return cb(new Error("Wrong hash"));
			}
		}
		else {
			return cb(error);
		}
	});
};

module.exports = MmsSnap;