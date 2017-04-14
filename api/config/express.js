var fileParser = require('skipper');
module.exports.express = {
	bodyParser: fileParser,
	retryBodyParserWithJSON: false
}
