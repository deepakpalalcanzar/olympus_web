Mast.models.UserWorkgroup = Mast.Collection.extend({
	model: 'UserWorkgroup',
	fetchWorkgroup: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/listUserWorkgroup', userId, function(res, err){
			if(res){
				console.log(res);
				self.reset(res);
				callback && callback();
 			}
		});
	}
}); 