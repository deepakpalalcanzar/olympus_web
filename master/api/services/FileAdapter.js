/**
 * File Adapter
 *
 * - Stateless
 * - agnostic about which Handshake and Manager api it uses
 * - stores token in existing session
 */
var adapter = getAdapterByKey(sails.config.fileAdapter.adapter);

module.exports.upload = adapter.upload;
module.exports.download = adapter.download;

// Return adapter module given the key string
function getAdapterByKey (key) {

	console.log(":as;kdalkas;ldas;lkasl;kasl;asl;poewpoopqwop");
	console.log(key);
	
	var adapter;
	switch (key) {
		case 's3': adapter = 'S3APIService'; break;
		case 'swift': adapter = 'SwiftAPIService'; break;
		case 'disk': adapter = 'DiskAPIService'; break;
		default: throw new Error ("Unknown file adapter store, "+sails.config.fileAdapter.store);
	}
	return require(__dirname + '/' + adapter);
}