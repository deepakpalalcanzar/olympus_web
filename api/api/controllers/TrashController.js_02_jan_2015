var TrashController = {

	restore: function(req, res){

		var options = {
			file_id : req.param('file_id'),
			type 	: req.param('type')
		};

		DeletedList.restore(options, function(err, account){
			if(err) return;
			return res.json(account, 200);
		});
	}
	
};

module.exports = TrashController;