/**
 * File Adapter
 *
 * - Stateless
 * - agnostic about which Handshake and Manager api it uses
 * - stores token in existing session
 */


var adapter = getAdapterByKey();

// module.exports.upload = adapter.upload;
// module.exports.download = adapter.download;

// Return adapter module given the key string
function getAdapterByKey () {

	console.log(":as;kdalkas;ldas;lkasl;kasl;asl;poewpoopqwop");
	// console.log(key);
	
	var adapter;
	UploadPaths.find({where:{isActive:1}}).done(function(err, res){
		console.log(res.type);
		switch ((res.type).toLowerCase()) {
			case 's3': adapter = 'S3APIService'; break;
			case 'swift': adapter = 'SwiftAPIService'; break;
			case 'disk': adapter = 'DiskAPIService'; break;
			case 'ormuco': adapter = 'OrmucoAPIService'; break;
			default: throw new Error ("Unknown file adapter store, "+res.type+", Adapter ID :"+res.id);
		}
		module.exports.upload = adapter.upload;
		module.exports.download = adapter.download;
		return require(__dirname + '/' + adapter);
	});
}