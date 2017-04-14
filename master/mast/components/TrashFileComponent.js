Mast.registerTree('TrashFileComponent',{
	
	extendsFrom: 'TrashComponent',

	collection  : 'TrashMembers',
	
	events: {
		'click >.expand-arrow': 'toggleExpandCollapse',
		'dblclick'	: 'toggleExpandCollapse'
	},
	
	// Toggle between expanding and collapsing directories.
	toggleExpandCollapse: function (e) {
		this.get('state') !='' ? this.collapse(e) : this.expand(e);
		this.select(e);
	},

	// Expand this directory, revealing its contents
	expand: function (e) {
		
		var self = this;
		this.set('state','loading');
		this.collection.reset();
		this.collection.fetchMembers(this,function(){
			self.set('state','expanded');
			self.$el.find('.shared_peop').not(":first").hide();// hide numbershared for files
		});
		if (e) {	e.stopPropagation(); }

	},
	
	// Collapse this directory and hide its contents
	collapse: function (e) {
		this.set('state','');
		if (e) { e.stopPropagation(); }
	}

});
