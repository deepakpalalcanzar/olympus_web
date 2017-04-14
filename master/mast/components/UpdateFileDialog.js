Mast.registerComponent('UpdateFileComponent',{

	extendsFrom: 'DialogComponent',
	template: '.update-dialog-template',
	outlet: '#content',
	
	afterRender: function(){
// Call inherited afterRender.
		Mast.components.DialogComponent.prototype.afterRender.call(this);
// Set uploader endpoint.
		this.children['.uploader'].set('endpoint','/directory/upload?replaceFileId='+this.get('id'));
	}

});
