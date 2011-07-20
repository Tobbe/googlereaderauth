var GoogleAuthorizer = require('./lib/google_reader_auth.js').GoogleAuthorizer;
var googleAuth = new GoogleAuthorizer();

googleAuth.on('authDone', function(access_token, access_token_secret) {
	var unixTimestamp = new Date().getTime();
	var url = 'http://www.google.com/reader/api/0/user-info?client=googlereaderauthexample&ck=' + unixTimestamp;
	googleAuth.oa.get(url, access_token, access_token_secret, function(error, data) {
		console.log(JSON.parse(data));
	});
});

googleAuth.on('verificationCodeNeeded', function(url) {
	console.log('Please go to ' + url);
	console.log('Please enter the verification code:');
	process.stdin.resume();
	process.stdin.once('data', function(code) {
		googleAuth.continueAuth(code.toString().trim());
	});
});

googleAuth.authWithGoogle();

