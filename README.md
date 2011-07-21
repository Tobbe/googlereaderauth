Google Reader Auth
==================

Google Reader Auth uses the OAuth module to simplify logging in to Google
Reader. It tries to remember the credentials so that the log in process
can be automated after the first successfull manual log in.

Exported Functions
------------------

### authWithGoogle()
Starts the authentication process. You will always want to call this function
after setting up your event handlers.

### continueAuth(code)
Continues the authentication process after it was stopped because it needed 
the user to approve that the application was allowed to access the user's 
data.

The 'code' parameter is the verification code provided by Google. It is needed
to be able to continue authenticating.

Generated Events
----------------

### 'authDone' (access_token, access_token_secret)
This is generated when the authentication process is finished. It is now
possible to access the user's data.

When catching the envent two parameters are passed along, the oauth access
token and the oauth access token secret. They should be used with the
functions from the OAuth module, for example 'get()'.

### 'verificationCodeNeeded' (url)
Generated when no valid access token and access token secret can be found in
the configuration file.

Ask the user to go to the url provided (or automatically show them the page
at that url). Google will generate a verification code that is needed to
complete the authentication. Pass this code to the 'continueAuth(code)'
function.

### 'error' (error)
This event is generated whenever an error occurs.

The parameter is a standard node.js error object with for example a 'stack'
property.

Usage Example
-------------

Make sure you install the inireader and oauth modules first (for example using
npm). Also create a file in the same dir as the example called 'conf.ini' with
one single line that says '[auth]' (for example by running 'echo "[auth]" > 
conf.ini' in your terminal).

Now you're ready to run the following example:

    var GoogleAuthorizer = require('googlereaderauth').GoogleAuthorizer;
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

