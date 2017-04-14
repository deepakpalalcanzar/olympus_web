var UUIDGenerator = require('node-uuid');

/**
 * Get a unique name for a file or directory
 *
 * @param modelClass mixed A class to get the unique name for (either File or Directory)
 * @param origName string A name to start with.  If the name is taken, appends "(copy)", "(copy 2)", etc. until the name is unique.
 * @param dirId int The ID of a directory to search in
 * @param cb mixed Function to call with the resulting name.  This is intended for use with async.auto; see the example in the "upload" function for cb usage
 */
var uniqueName = function(modelClass, origName, dirId, cb, replaceFile) {
	// Make sure the file is unique
	var fileName = origName; // The currently nominated filename
	var nameApproved = replaceFile || false; // State of approval for the name
	var checking = false; // Flag indicating whether an async Sequelize "find" call is pending
	var copyNum = 0; // Counts how many names we've gone through
	var dotLoc = origName.indexOf('.'); // Location of the dot in the filename, if any
	// Start a loop that checks for a file with the same name as the one that
	// was just uploaded.  Since Sequelize retrieves objects asyncronously, we
	// need to use this kind of construct instead of a regular loop.  We have
	// a var that holds the current "state" of the name approval, i.e. whether or
	// not we've found a unique name.  Once the name is approved, the construct
	// will call the third function which moves along the outer async.auto construct.
	async.until(
	// Test the current state of the name approval
	function() {
		return nameApproved;
	},

	// If there's not already a call out to check the currently nominated
	// name, make one now
	function(callback) {
		// Indicate that a call is out, so we don't make another one for
		// the same name.
		modelClass.find({
			where: {
				name: fileName,
				DirectoryId: dirId,
				deleted: null
			}
		}).success(function(retrievedFile) {
			// If we find a file with the nominated name, then
			// nominate a new name and start the process over
			if(retrievedFile !== null) {
				copyNum++;
				var copyString = ' (V';
				if(copyNum >= 1) {
					copyString += copyNum;
				}
				copyString += ')';
				if(dotLoc > -1) {
					fileName = origName.substr(0, dotLoc) + copyString + origName.substr(dotLoc);
					// fileName = origName + copyString; // by alcanzar
				} else {
					fileName = origName + copyString;
				}
			}
			// Otherwise flag the name as approved.  This will cause
			// the async.until construct to fall through to the
			// final method
			else {
				nameApproved = true;
			}
			callback();
		});
	},

	// This method gets called once a name has been approved.  It runs the
	// callback that moves the async.auto construct forward.
	function() {
		var uuid = UUIDGenerator.v1();
		var fsName = uuid + "." + _.str.fileExtension(origName);
		var newPath = sails.config.appPath + "/public/files/" + fsName;
		sails.log.debug("APPROVED: " + fileName);
		cb(null, {
			uuid: uuid,
			fsName: fsName,
			fileName: fileName,
			newPath: newPath
		});

	});
};


module.exports = {
	unique: uniqueName
};