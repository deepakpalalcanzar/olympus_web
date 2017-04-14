Mast.registerComponent('TrashRestoreComponent', {

	extendsFrom 	: 'DialogComponent',
	template 		: '.trash-dialog-template',
	outlet 			: '#content',
	collection		: 'Workgroups',
	branchComponent	: 'DirectoryComponent',
	branchOutlet	: '.popup-body',

	events : {
		'click label' 			: 'getWorkgroupChild',
		'click .upload-button' 	: 'updateRestore'
	}, 

	init: function(){

		var self = this;
		var file_id 	= this.get('id');
		var file_type 	= this.get('type');

		Mast.Socket.request('/tempaccount/getWorkgroups', {
			dir_type : '0',
			item_id  : file_id
		}, function(res, err){

			console.log("resresresresresresresresresresresresresresres");
			console.log(res);
			console.log("resresresresresresresresresresresresresresres");

			if(res[0].deleted){
				$(".popup-body li").html("<input type='radio' name='fileselected' id='item-"+res[0].id+"' /><label for='item-"+res[0].id+"' data-attr='item-"+res[0].id+"' class='class-"+res[0].id+"'>"+res[0].name+"</label>");
			}else{
				self.closeDialog();
				Mast.Socket.request('/trash/restore', {
					id 			 : file_id,
					type 		 : file_type,	
					directory_id : ''					
				}, function(response){
					if (response===403) {
						alert('Permission denied. You do not have sufficient permissions to restore this item.');
					} else {
						
						$("#content").empty();
						var trash = new Mast.components.TrashFileSystem({ outlet : '#content'});
					}
				});
			}

		});
	},

	getWorkgroupChild: function(e){

		$('.trash-dialog-template .no-submit').removeClass('no-submit');

		var file_id = this.get('id');

		//IE-e.srcElement
		//other than IE-e.target
		var clickedElement 	= (typeof e.srcElement != 'undefined')?e.srcElement.htmlFor:e.target.getAttribute('for');
		// console.log('clickedElementclickedElementclickedElement');
		// console.log(clickedElement);
		var element 		= clickedElement.split("-");
		var element_id 		= element[element.length-1];
		var container_ul = $(".class-"+element_id).parent('li').find('ul');
		if(container_ul.length == 0){

			Mast.Socket.request('/tempaccount/getWorkgroupChild', {
				dir_type : element_id,
				item_id  : file_id
			}, function(res, err){
				var htmlCotent = "<ul>";
				$.each( res, function( i, val ) {
					htmlCotent +="<li style='padding:7px;'><input type='radio' name='fileselected' id='item-0-"+val.id+"' /><label for='item-0-"+val.id+"' class='class-"+val.id+"'>"+ val.name +"</label> </li>";
				});
				htmlCotent +="</ul>";
				$(".class-"+element_id).after(htmlCotent);
			});
		}
	},

	updateRestore : function(){
		var self = this;
		var selectedElem 	= $('input[name=fileselected]:checked').attr('id');
		var element 		= selectedElem.split("-");
		var element_id 		= element[element.length-1];

		Mast.Socket.request('/trash/restore', {
			id 	 			: this.get('id'),
			directory_id 	: element_id,
			type 			: this.get('type')//'file'
		}, function(response){
			if (response===403) {
				alert('Permission denied. You do not have sufficient permissions to delete this item.');
			} else {
				self.closeDialog();
				$("#content").empty();
				var trash = new Mast.components.TrashFileSystem({ outlet : '#content'});
			}
		});
	},


	// Removes all refernces to the dialog component and removes it from the DOM.
	closeDialog: function() {
		this.close();
	},

	bindings: {
		// Displayed/hides the ajax spinner if user is uploading or finished uploading file.
		uploading: function(newVal) {
			if (newVal) {
				// Since we have the progress bar, we'll close the dialog as soon as we start the upload
				this.closeDialog();
			}
		}
	}
});
