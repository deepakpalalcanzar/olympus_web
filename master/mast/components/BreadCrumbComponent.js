Mast.registerComponent('BreadCrumbItem',{
	template: '.breadCrumbItem-template'
});

Mast.registerTree('BreadCrumbTree',{
	// will use to keep track of how much space we have to 
	// add new bread crumb items
	model: {
		widthRemaining: 940
	},

	template: '.breadCrumb-template',
	outlet	: '#content',

	events: {
		'click .breadCrumb-list'		: 'addCrumb',	
		'click input': 'removeCrumb'
	},

	rowcomponent: 'BreadCrumbItem',
	collection	: 'BreadCrumbList',
	rowoutlet	: '#breadCrumb-outlet',
	crumbWidth	: 116,

	emptyHTML: 'BreadCrumbs go here',

	
	
	// On add event will check that there is enough space 
	// for us to add another bread crumb.
	// If there isnt enough space we have to change the left most item 
	// and also display only enough bread crumbs for the table to 
	// be usable.
	init: function() {
		this.collapsedItemsStack = [];

	},

	afterRender: function() {
		this.$el.disableSelection();
	},

	// create a new bread crumb instance and add it to the collection
	addCrumb: function(name) {
		this.collection.add({dirName: 'name'});
		this.set({'widthRemaining': this.get('widthRemaining') - this.crumbWidth });

		// if there is not enough room, set model collapsed attribute to true
		// then push the first noncollapsed model on to the collapsed item stack
		if (this.get('widthRemaining') <= this.crumbWidth) {
			this.collection.at(this.collapsedItemsStack.length).set({collapsed: true});
			this.collapsedItemsStack.push(this.collection.at(this.collapsedItemsStack.length));
		}

	},


	// get the last bread crumb in the collection and remove it
	removeCrumb: function() {
		var collection = this.collection;
		collection.remove(collection.last());
		this.set({'widthRemaining': this.get('widthRemaining') + this.crumbWidth });
		if (this.collapsedItemsStack.length > 0) {
			this.collapsedItemsStack.pop().set({collapsed: false});
		}
	}
});