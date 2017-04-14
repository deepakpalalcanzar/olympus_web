Mast.models.BreadCrumb = Mast.Model.extend({

	defaults: function() {
		return {
			dirName: 'folder name', 
			collapsed: false
		}
	}
});

Mast.models.BreadCrumbList = Mast.Collection.extend({

	model: Mast.models.BreadCrumb

});