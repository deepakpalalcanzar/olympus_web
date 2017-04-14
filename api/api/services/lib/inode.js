var async = require('async');

var Utils = module.exports = {};

/**
 * Ensure A Unique Name for each child directory
 *
 * @param {String} new name for file
 * @param {Integer} directory ID to check uniqueness in
 * @param {Function} callback
 */

Utils.uniqueName = function (type, name, parentId, cb, copyNum, origName) {

	var Model;
	if (type == 'file') {
		Model = sails.models['file'];
	}
	else if (type == 'directory') {
		Model = sails.models['directory'];	
	}
	else {
		throw new Error('uniqueName `type` must be "file" or "directory".');
	}

	origName = origName || name;

	Model.findOne({ name: name, DirectoryId: parentId, deleted: false }).exec(function(err, inode) {
		if (err) {return cb(err);}
		if (inode) {
			copyNum = copyNum ? (++copyNum) : 1;
			var copyString = " (copy";
			if (copyNum > 1) {copyString += " " + copyNum;}
			copyString += ")";
			var dotLoc;
			if ((dotLoc = origName.indexOf('.')) !== -1) {
				name = origName.substr(0, dotLoc) + copyString + origName.substr(dotLoc);
			} else {
				name = origName + copyString;
			}
			return Utils.uniqueName(type, name, parentId, cb, copyNum, origName);
		}
		return cb(null, name);
	});

};
