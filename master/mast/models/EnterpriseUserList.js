Mast.registerModel('EnterpriseUser',{
	defaults: function() {
		return {
			id		: '1',
			name	: 'someName',
			avatar	: '/images/38.png'
		}
	}
});

Mast.registerCollection('EnterprisesUser', {	
	autoFetch: false,
	model: 'EnterpriseUser',
	enterpriseWorkgroup: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/listEnterprisesMembers', { id: inodeAttrs.id }, function(res, err){
			if(res.length){
				self.reset(res);
				callback && callback(res);
 			}else{
 				$('.loading-spinner').removeClass('loading-spinner').addClass('enterprises-user-row-template').html('No records found!');
 			}
		});

	}
}); 