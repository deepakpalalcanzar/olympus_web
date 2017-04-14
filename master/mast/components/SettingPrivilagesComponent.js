Mast.components.SettingsComponent  = Mast.Component.extend({
	template: '.settings-template',
	outlet: '#content'

});

function autoclick(id) {
	document.getElementById(id).click();
}

function cssFileSelected(input) {
	var fullPath = document.getElementById('css_file').value;
	if (fullPath) {
		var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		var filename = fullPath.substring(startIndex);
		if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
		var tbox = document.getElementById('css_file_input');
		tbox.value = filename;
	}
}

var fileBinary, fileData, options, cropper;

function zoomIn(){
    cropper.zoomIn();
}

function zoomOut(){
    cropper.zoomOut();
}

function cropImage(){


	var file = fileData[0];
	var img = cropper.getDataURL();
	$('.cropped').html('');
	$('.main-logo').attr('src', img);
	$('.cropped').append('<img src="'+img+'">');
	
	Mast.Socket.request('/account/imageUpload', { name:file.name, type:file.type, size:file.size, binary: img, pic_type : 'enterprise' }, function(req, res, next) {

	});	

}

function previewImage(){

	var file = fileData[0];
	var img = cropper.getDataURL();
	$('.cropped_profile_image').html('');
	$('.cropped_profile_image').append('<img src="'+img+'">');
	// $('.user-avatar').attr('src', img);
	// Mast.Socket.request('/account/imageUpload', { name:file.name, type:file.type, size:file.size, binary: img, pic_type : 'profile' }, function(req, res, next) {

	// });	
}




$(window).load(function() {

	options = {
        thumbBox: '.thumbBox',
        spinner: '.spinner',
        imgSrc: 'avatar.png'
    }

    if($('.imageBox').length){
		cropper = $('.imageBox').cropbox(options);
	}
        
});

function fileSelected(input) {

	var reader = new FileReader();

    reader.onload = function(e) {
    	fileData = input.files;
        options.imgSrc 	= e.target.result;
        cropper 		= $('.imageBox').cropbox(options);
        // $('.main-logo').attr('src', e.target.result);
    }
    
    reader.readAsDataURL(input.files[0]);
    input.files = [];


}


function avatarSelected (input) {
	console.log(input);
		var reader = new FileReader();

    reader.onload = function(e) {
    	fileData = input.files;
        options.imgSrc 	= e.target.result;
        cropper 		= $('.avatarBox').cropbox(options);
        // $('.main-logo').attr('src', e.target.result);
    }
    
    reader.readAsDataURL(input.files[0]);
    input.files = [];

}
