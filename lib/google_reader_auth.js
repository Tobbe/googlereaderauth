var util = require('util');
var OAuth = require('oauth').OAuth;
var EventEmitter = require('events').EventEmitter;
var iniReader = require('inireader');
var parser = new iniReader.IniReader();

function GoogleAuthorizer() {
	EventEmitter.call(this);

	this.oa = new OAuth("https://www.google.com/accounts/OAuthGetRequestToken",
		"https://www.google.com/accounts/OAuthGetAccessToken", 
		"anonymous", "anonymous", "1.0A", undefined, "HMAC-SHA1");
}
util.inherits(GoogleAuthorizer, EventEmitter);

exports.GoogleAuthorizer = GoogleAuthorizer;

GoogleAuthorizer.prototype.authWithGoogle = function() {
	parser.load('conf.ini');
	var auth_access_token = parser.param('auth.token');
	var auth_access_secret = parser.param('auth.secret');

	this._verifyAuth(auth_access_token, auth_access_secret, this.verifyAuthCallback);
};

GoogleAuthorizer.prototype.continueAuth = function(code) {
	this.oa.getOAuthAccessToken(this._oauth_token, this._oauth_token_secret, code, this._accessTokenCallback.bind(this));
}

GoogleAuthorizer.prototype._verifyAuth = function(access_token, access_token_secret) {
	var url = "http://www.google.com/reader/api/0/subscription/list?output=json";
	this.oa.get(url, access_token, access_token_secret, function(error, data) {
		this._handleVerifyAuthGetResponse(error, access_token, access_token_secret)
	}.bind(this));
}

GoogleAuthorizer.prototype._handleVerifyAuthGetResponse = function(error, auth_access_token, auth_access_secret) {
	if (error && error.statusCode != 401) {
		this.emit('error', error);
	} else if (error && error.statusCode == 401) {
		this.oa.getOAuthRequestToken({"scope":"http://www.google.com/reader/api"}, function(error, oauth_token, oauth_token_secret, results) {
			if (error) {
				this.emit('error', error);
			} else {
				this._oauth_token = oauth_token;
				this._oauth_token_secret = oauth_token_secret;
				var url = 'https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token=' + oauth_token;
				this.emit('verificationCodeNeeded', url);
			}
		}.bind(this));
	} else {
		this.emit('authDone', auth_access_token, auth_access_secret);
	}
}

GoogleAuthorizer.prototype._accessTokenCallback = function(error, access_token, access_token_secret, results) {
	if (error) {
		this.emit('error', error);
	} else {
		parser.param('auth.token', access_token);
		parser.param('auth.secret', access_token_secret);
		parser.write();

		this.emit('authDone', access_token, access_token_secret);
	}
}

