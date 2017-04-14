Mast.registerModel('SearchUser',{
	defaults: function() {
		return {
			id		: '1',
			name	: 'someName',
			avatar	: '/images/38.png'
		}
	}
});

Mast.registerCollection('Searchresult', {	

	autoFetch: false,
	model: 'SearchUser',
	searchUsers: function(inodeAttrs,callback) {
		var self = this;
		Mast.Socket.request('/account/search', { term: inodeAttrs.term,from_page: inodeAttrs.from_page }, function(res, err){
			console.log("resresresresresresresresresresresresresres");			
			console.log(res);			
			console.log(err);			
			if(res){
				self.reset(res);
				callback && callback(res);
 			}
		});

	}
}); 