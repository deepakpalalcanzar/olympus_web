Mast.DropdownHelper = {
// return  where on the page the inode button is positioned
	// we will need this to tell the action dropdown menu where to be placed
	// when the inode's dropdown button is clicked
	findButtonPosition: function($el,xOffset,yOffset) {
		var baseOffset = $el.offset();
		return {
			xPos: baseOffset.left + xOffset,
			yPos: baseOffset.top + yOffset
		};
	},

	// Return mouse position]
	findMousePosition: function(e){
		return {
			xPos: e.pageX,
			yPos: e.pageY
		};
	},

	showDropdown: function(position,caller,actions) {
		if (Olympus.ui.dropdown){
			Olympus.ui.dropdown.hideDropdown();
			return;
		} else {
			Olympus.ui.dropdown = Olympus.ui.dropdown || new Mast.components.DropdownComponent({
				caller: caller,
				actions: actions
			});
		}
		Olympus.ui.dropdown.setOffset(position);
	},

	showDropdownAtMousePosition: function(e,caller,actions) {
		e.preventDefault();
		e.stopImmediatePropagation();
		Mast.DropdownHelper.showDropdown(
			Mast.DropdownHelper.findMousePosition(e),
			caller, 
			actions
		);
	},

	showDropdownAt: function ($el,xOffset,yOffset,e,caller,actions) {
		e.preventDefault();
		e.stopImmediatePropagation();
		Mast.DropdownHelper.showDropdown(
			Mast.DropdownHelper.findButtonPosition($el,xOffset,yOffset),
			caller,
			actions
		);
	}
	
}