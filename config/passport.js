// config/passport.js
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, accessDb) {
    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id_user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        accessDb.deserializeUser(id, done);
    });

    //login
    passport.use('login-local', 
        new LocalStrategy({
                passReqToCallback : true
            },
            function(request, username, password, done) {
                accessDb.login(username, password, done); 
            }
        )
    );
    
    //signup
    passport.use('local-signup',
        new LocalStrategy({
                passReqToCallback : true 
            }, 
            function(request, username, password, done) {
                accessDb.signup(request, username, password, done);
            }
        )
    );
};