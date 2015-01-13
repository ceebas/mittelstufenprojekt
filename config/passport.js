// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database.js');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user);
        done(null, user.id_user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from " + dbconfig.tableUsers + " where id_user = "+ id, function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use('login-local', new LocalStrategy({
            passReqToCallback : true
        },
        function(request, username, password, done) {
            connection.query("select * from " + dbconfig.tableUsers + " where username = '" + username + "'",function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));
                }
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );

    passport.use(
        'local-signup',
        new LocalStrategy({
            passReqToCallback : true }, function(request, username, password, done) {
            connection.query("select * from " + dbconfig.tableUsers + " where username = '" + username + "'", function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, request.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO " + dbconfig.tableUsers + " ( username, password ) values ('" + newUserMysql.username + "','" + newUserMysql.password + "')";

                    connection.query(insertQuery,function(err, rows) {
                        if (err) return done(err);
                        return done(null);
                    });
                }
            })
        })
    );
};