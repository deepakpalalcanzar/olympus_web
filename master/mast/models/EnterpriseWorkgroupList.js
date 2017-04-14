Mast.registerModel('WorkgroupEnterprises',{
	defaults: function() {
		return {
			id	: '1',
			name	: 'someName',
			avatarSrc	: '/images/icon_workgroup@2x.png'
		}
	}
});

Mast.registerCollection('EnterprisesWorkgroup', {	
	autoFetch: false,
	model: 'WorkgroupEnterprises',
	enterpriseWorkgroup: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/listUserWorkgroup', { id: inodeAttrs.id }, function(res, err){
			if(res){
				self.reset(res);
				callback && callback(res);
 			}
		});

	}
}); 