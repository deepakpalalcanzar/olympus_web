Mast.registerModel('WorkgroupUsers',{
	defaults: function() {
		return {
			id	: '1',
			name	: 'someName',
			avatarSrc	: '/images/icon_workgroup@2x.png'
		}
	}
});

Mast.registerCollection('UsersWorkgroup', {	
	autoFetch: false,
	model: 'WorkgroupUsers',
	fetchWorkgroup: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/listUserWorkgroup', { id: inodeAttrs.id }, function(res, err){
			if(res){
				self.reset(res);
				callback && callback(res);
 			}
		});
	}
}); 