Mast.registerModel('AdminUser',{
	defaults: function() {
		return {
			id	: '1',
			name	: 'someName',
			avatarSrc	: '/images/icon_workgroup@2x.png',
			email   :  'admin@olympus.io',
		}
	}
});

Mast.registerCollection('AdminUserDetails', {	
	autoFetch: false,
	model: 'AdminUser',
	fetchAdminUserDetails: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/adminuser/userDetails', { id: inodeAttrs.id }, function(res, err){
			if(res){
				self.reset(res);
				callback && callback(res);
 			}
		});
	}
}); 