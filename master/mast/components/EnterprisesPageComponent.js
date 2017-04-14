Mast.registerComponent('EnterprisesPage', {

	model   : 'Enterprises',
	template: '.enterprises-page-template',
	outlet  : '#content',
	regions: {
		'.enterprises-table-region'  : 'EnterprisesTable'
	},

	init: function() {
		this.on('openSidebar', this.createSidebar);
		var userId =  { name : '1' };
//Calling From Master Branch API consuption is not yet implemented		
		/*Mast.Socket.request('/enterprises/listEnterprises', userId, function(res, err){
			if(res){
				console.log(res);
			}
		});*/
		
	},
	createSidebar: function(model) {
		this.attach('.enterprises-sidebar-region',
			Mast.components.EnterprisesSidebar.extend({
				model: model
			})
		);
	}

});


