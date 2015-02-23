// config/passport.js
var LocalStrategy = require('passport-local').Strategy;
var db = require('./database.js');

module.exports = function(passport,fs, bcrypt, mysql) {
    // Datenbankverbindung herstellen
    mysql.connect(db.connection.host, function(err, client, done) {

        // used to serialize the user for the session
        passport.serializeUser(function(user, done) {
            done(null, user.id_user);
        });

        // used to deserialize the user
        passport.deserializeUser(function(id, done) {
            client.query("select * from " + db.tableUsers + " where id_user = "+ id, function(err, rows){
                done(err, rows[0]);
            });
        });

        //login
        passport.use('login-local', 
            new LocalStrategy({
                passReqToCallback : true
            },
                function(request, username, password, done) {
                    client.query("select * from " + db.tableUsers + " where username = '" + username + "'",function(err, rows){
                        if (err) {
                            return done(err);
                        }
                        if (!rows.length) {
                            return done(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));
                        }
                        if (!bcrypt.compareSync(password, rows[0].password)) {
                            return done(null, false, request.flash('loginMessage', 'Falscher Benutzername oder falsches Passwort!'));
                        }
                        if (rows[0].inactive == 1) {
                            return done(null, false, request.flash('loginMessage', 'Dein Account ist inaktiv, bitte wende dich an einen Admin!'))
                        }
                        //Benutzerordner wird erstellt, wenn nicht vorhanden
                        var userid = rows[0].id_user;
                        var path = "uploads/" + userid;
                        fs.exists(path, function(exists) {
                            if(!exists) {
                                fs.mkdir(path, 0777, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                        return done(null, rows[0]);
                    });
                }
            )
        );

        //signup
        passport.use('local-signup',
            new LocalStrategy({
                passReqToCallback : true 
            }, 
                function(request, username, password, done) {
                    client.query("select * from " + db.tableUsers + " where username = '" + username + "'", function(err, rows) {
                        if (err)
                            return done(err);
                        if (rows.length) {
                            return done(null, false, request.flash('signUpMessage', 'Benutzername schon vergeben!'));
                        } else {
                            // Neuen Benutzer erstellen, falls noch nicht vorhanden
                            var newUser = {
                                username: username,
                                email: request.body.email,
                                password: bcrypt.hashSync(password, null, null)
                            };

                            var insertQuery = "INSERT INTO " + db.tableUsers + " ( username, email, password ) values ('" + newUser.username + "','" + newUser.email +"','" + newUser.password + "')";

                            client.query(insertQuery,function(err, rows) {
                                if (err) {
                                    return done(err);
                                } 
                                //Ordner für Uploads wird erstellt
                                client.query("SELECT LAST_INSERT_ID() as userid", function(err, rows, fields){
                                    var userid = rows[0].userid;
                                    var path = "uploads/" + userid;
                                    fs.mkdir(path, 0777, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                });
                                return done(null);
                            });
                        }
                    });
                }
            )
        );
    });
}