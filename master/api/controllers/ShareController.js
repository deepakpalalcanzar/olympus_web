/*---------------------
	:: Share 
	-> controller
---------------------*/
var ShareController = {
  // create a new Share
  // TODO: Rewrite to use async for easier to read code.
  create: function (req, res) {
    var shareModel = (req.param('controller') == 'directory') ? Directory : File;
    // The email parameter can be an array or a string
    if (req.param('email')) {
      Account.findAll({
        where: {
          email: req.param('email')
        }
      }).done(function (err, accounts) {

        // Find the instance to be share of our share model
        shareModel.find(req.param('id')).done(function (err, shareModelInstance) {
          if (err) return res.json({error: err});

          var shareAttributes = {
              accounts: accounts,
            name: req.param('name') || shareModelInstance.name
          };

          shareModel[req.param('controller')] = shareModelInstance;
          Share.create(shareAttributes).done(function (err, share) {
            if (err) return res.json({error: err});

            return res.json({
              id: share.id,
              name: share.name,
              accounts: share.accounts,
              link: share.getLink()
            });
          });
        });
      });
    } else return res.json({error: 'No email parameter provided.'});
  },

  // Download a share.
  download: function (req, res) {
    Share.find(req.param('id')).done(function (err, share) {
      if (err) return res.json({error: err});

      // Save the type id.
      var shareTypeId = share.directory ? share.directory.id : share.file.id;

      // Make sure the authenticated account has permission
      share.getAccounts({where: {id: req.session.Account.id}}).done(function (err, accounts) {
        // Cal the associated download method of the correct inode type.
        (share.directory ? DirectoryController : FileController)._download(req, res, shareTypeId);
      })
    })
  },

  // Delete a share
  'delete': function (req, res) {
    Share.find(req.param('id')).done(function (err, share) {
      share.getCreator({where: {id: req.session.Account.id}}).done(function (err, creator) {
        share.destroy().done(function (err) {
          return res.json(err ? {error: err} : {success: true});
        });
      });
    });
  }

};