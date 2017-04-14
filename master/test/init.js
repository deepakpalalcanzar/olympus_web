// Dependencies
var _ = require('underscore');
var assert = require("assert");

before(function (cb) {
	Boot = new require("./bootstrap")(cb);
});

describe('olympus', function (){

	describe('app',function () {
		it('should initialize',function (done) {
			done();
		});

		it('should still be running after a few miliseconds',function (done) {
			setTimeout(done,500);
		});

		it('should close properly',function (done) {
			Boot.sails.lower();
			done();
		});
	});
});