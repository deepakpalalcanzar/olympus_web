// Hack until my pull request for _.str is accepted:
_.str.fileExtension = function (str) {
	if (str == null) return '';
	return _.last(String(str).split('.'));
};