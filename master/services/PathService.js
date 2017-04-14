

var PathService = {

	// Lookup file by path
	lookupFile: function (path, cb) {

		path = _.str.trim(path,'/');

		console.log("PATH",path);

		// Invalid path and/or id
		if (!_.isString(path)) return cb("Invalid path! "+path, path);

		// If path is specified, but no id, lookup the id
		else {

			var foundFile;
			var slashCount = 1;
			async.until(
			    function truthTest () { 
					return slashCount === 0;
			    },
			    function iterator (cb) {
					// Grab part to the right of the final slash
					var name = _.str.strLeft(path,'/');
					slashCount = _.str.count(path,'/');
					path = _.str.strRight(path,'/');
					_.shout("SlashCount",slashCount);
					_.shout("remaining path",path);

					// If slashes remain in the path, 
					// we need to find [another] directory
					if (slashCount > 0) {
						console.log("Finding dir",name);
						findByName(Directory, name, function directoryFound (err,dir) {
							if (err) return cb(err);
							else if (!dir) return cb("No directory exists by that name: "+dir);
							else return cb();
						});
					}

					// If no slashes remain in the path, 
					// we've made it to the file
					else {
						console.log("finding file",name);
						findByName(File, name, function fileFound (err,file) {
							_.shout("foundFile",file && file.id, "error:",err);
							if (err) return cb(err);
							else if (!file) return cb("No file exists by that name: "+name);
							else {
								foundFile = file;
								return cb();
							}
						});
					}
			    },
			    function done (err) {
			        if (err) return cb(err);

			        // Return the file
			        else return cb(null, foundFile);
			    }
			);
		}
	}
};
module.exports = PathService;

function findByName(model, name, cb) {
	model.find({
		where: {
			name: name
		}
	}).done(cb);
}