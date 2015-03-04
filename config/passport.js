// config/passport.js
var LocalStrategy = require('passport-local').Strategy;
var db = require('./database.js');

module.exports = function(passport, fs, bcrypt, mysql, accessDb) {
    // Datenbankverbindung herstellen
    var connection = mysql.createConnection(db.connection);
    connection.query('USE ' + db.database);
    
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
                accessDb.login(username, password, fs, done); 
            }
        )
    );
    
    //signup
    passport.use('local-signup',
        new LocalStrategy({
                passReqToCallback : true 
            }, 
            function(request, username, password, done) {
                accessDb.signup(request, username, password, fs, done);
            }
        )
    );
};