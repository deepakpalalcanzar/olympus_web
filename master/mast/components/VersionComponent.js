// version tab component
Mast.registerComponent('VersionComponent',{

	template: '.version-template',
	outlet	: '.activity-sharing-outlet',
	events: {
		'click .file_download' : 'downloadVersion'
	},
	// create new current viewers and inode comments components
	afterRender: function() {
		this.versionList = new Mast.components.VersionList({
			model: this.pattern.model
		});
	},
	
	show: function(){
		this.$el.show();
	},
	
	hide: function() {
		this.$el.hide();
	},

	downloadVersion: function(event) {

		var fileId = $( event.target ).closest( "div" ).attr('id');
		var result = fileId.split('_');
		var url = "/file/open/"+result[1]+"/"+event.target.innerHTML;
		window.open(url, '_blank');
		window.focus();

	}
});
