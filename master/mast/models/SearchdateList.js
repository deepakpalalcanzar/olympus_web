Mast.registerModel('SearchdateUser',{
	defaults: function() {
		return {
			name			: 'someName',
			text_message	: 'Client Activity',
			ip_address		: '255.255.255.0',
			created_at		: 'Mar 21 2015 07:15 AM',
			platform		: '-'
		}
	}
});



Mast.registerCollection('Searchdateresult', {	

	autoFetch: false,
	model: 'SearchdateUser',
	searchdateUsers: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/searchdate', { from: inodeAttrs.from,to: inodeAttrs.to,activity: inodeAttrs.activity,from_page: inodeAttrs.from_page }, function(res, err){
			if(res){
				self.reset(res);
				callback && callback(res);
 			}
		});
	}

});  

