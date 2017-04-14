// INodeController
//
// At some point, the INodeService code
// (which is largely just a collection of shared controller actions)
// should be put in this file instead and made directly accessible.
//
// This refactoring will make the project quicker to understand for new developers.
//
_.extend(module.exports,{

	// Get the top level directories and files for this user
	topLevel: function (req,res) {

		// New Sails 1.0 db-agnostic relational methodology:
		/*
		Directory.join(DirectoryPermission,"DirectoryId").where({
			orphan: true
		});
		*/

		// Get all files and directories accessible to the user that are
		// either orphaned or are naturally residing on the top level.
		// Orphaned nodes are ones that the user has permissions on, but
		// not on their parent folder.
		async.parallel({
			orphanDirectories: function(cb) {
				var options = {accountId: req.session.Account.id};
				var basicSet = ["SELECT p.type AS permission, d.id AS pk, d.* "+
							"FROM directory d "+
							"INNER JOIN directorypermission p ON p.DirectoryId=d.id "+
							"INNER JOIN account a ON a.id=p.AccountId "+
							"WHERE (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin') "+
							"AND a.id=? "+
							"AND (d.DirectoryId is NULL OR p.orphan = true)"];
							options.parentId && basicSet.push(options.parentId);
							options.accountId && basicSet.push(options.accountId);
							basicSet = Sequelize.Utils.format(basicSet);
				sequelize.query(Directory.hybridSetQuery(options, basicSet),Directory).done(function(err, dirs) {
					if (err) {return cb(err);}
      				async.forEach(dirs, function(dir, cb) {dir.recalculateSize(cb);}, function(err){cb(err, dirs);});
				});
			},
			orphanFiles: function(cb){
				var options = {accountId: req.session.Account.id};
				
				var basicSet = ["SELECT p.type AS permission, f.id AS pk, f.* "+
							"FROM file f "+
							"INNER JOIN filepermission p ON p.FileId=f.id "+
							"INNER JOIN account a ON a.id=p.AccountId "+
							"WHERE (p.type='read' OR p.type='comment' OR p.type='write' OR p.type='admin')"+
							"AND a.id=? "+
							"AND (f.DirectoryId is NULL OR p.orphan = true)"];
							options.parentId && basicSet.push(options.parentId);
							options.accountId && basicSet.push(options.accountId);
							basicSet = Sequelize.Utils.format(basicSet);

				

				sequelize.query(basicSet,File).done(cb);
			}

		}, afterwards);

		function afterwards(err, results) {
			if (err) return res.send(500,err);
			var response = [];
			if (results.orphanDirectories) {
				_.each(results.orphanDirectories,function(v,k) { // Subscribe to workgroups
					v.subscribe(req);
				});
				response = response.concat(APIService.Directory.mini(results.orphanDirectories));
			}

			console.log(results.orphanFiles);

			if (results.orphanFiles) {
				_.each(results.orphanFiles,function(v,k) { // Subscribe to workgroups
					v.subscribe(req);
				});
				response = response.concat(APIService.File.mini(results.orphanFiles));
			}
			res.json(response);
		}
	}
});