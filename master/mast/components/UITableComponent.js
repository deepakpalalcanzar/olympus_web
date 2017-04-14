Mast.registerTree('UITableComponent',{
	
	model: {
		column1: {
			name: 'Files',
			className: 'file-column'
		},
		column2: {
			name: 'Last Modified',
			className: 'modified'
		},
		column3: {
			name: 'Information',
			className: 'information'
		}
	},

	emptyHTML: 'Empty',
	template: '.mast-ui-table',
	collection: [],
	branchOutlet: '.list-outlet',
	bindings: {
		visible: function (visible) {
			
		}
	},

	afterRender: function() {
		this.$el.disableSelection();
	},
	
	// Fetch data on initialization
	init: function () {

		var self = this;
		this.collection.fetch({
			success: function (model,res) {
				self.collection.reset(_.map(res, Mast.models.INode.prototype.marshal));
			}
		});
	}

});
