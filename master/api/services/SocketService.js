// Return a message when an incompatible request tries to access a socket feature
exports.wrongTransportError = function(res) {
	res.json({
		success: false,
		error:{
			message: 'This method is only accessible via socket.io.'
		}
	});
	return false;
}

// Send a comet message to the clients subscribed to this inode
// letting them know there was an activity
exports.broadcast = function(activityName,roomName,data) {
	
	// TODO: log Event to logdb
	sails.log.debug("SENDING ACTIVITY",activityName,"*****************",APIService.Event(activityName,new Date(), data));
	
	io.sockets['in'](roomName).json.send({										// Respond using the Event API
		uri			: activityName,
		data		: APIService.Event(activityName,new Date(), data)
	});
};