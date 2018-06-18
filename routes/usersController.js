// Imports
var bcrypt   = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models   = require('../models');
var asyncLib = require('async');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,20}$/;
const USERNAME_REGEX = /^([a-zA-Z])[a-zA-Z_-]*[\w_-]*[\S]$|^([a-zA-Z])[0-9_-]*[\S]$|^[a-zA-Z]*[\S]$/;

// Routes
module.exports = {
    register: function (req, res){
        // Parameters
        var email     = req.body.email;
        var username  = req.body.username;
        var password  = req.body.password;
        var biography = req.body.biography;

        // Check username, email and password regex
        if (!USERNAME_REGEX.test(username) || username === null) {
            return res.status(400).json({'error': 'username must be lenght between 4 and 15 character'});
        }

        if (!EMAIL_REGEX.test(email) || email === null){
            return res.status(400).json({'error': 'invalid email address format'});
        }

        if (!PASSWORD_REGEX.test(password) || password === null){
            return res.status(400).json({'error': 'invalid password format, password must be between 8 and 20 digits long, include at least one numeric digit and does not contains special character'});
        }

        // Register process
        asyncLib.waterfall([
            // Search record in database with mail or username
            function(done) {
                models.User.findOne({
                    attributes: ['email', 'username'],
                    where: {
                        $or : [{email: email}, {username: username}]
                    }
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'unable to verify user'});
                    })
            },
            // Check if user already exist and encrypt password
            function (userFound, done) {

                if (!userFound) {
                    bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else if (userFound.email === email && userFound.username === username) {
                    return res.status(409).json({'error': 'user already exist (email & username)'});
                } else if (userFound.email === email) {
                    return res.status(409).json({'error': 'user already exist (email)'});
                } else if (userFound.username === username) {
                    return res.status(409).json({'error': 'user already exist (username)'});
                } else {
                    return res.status(409).json({'error': 'user already exist'});
                }
            },
            // Create user in database
            function (userFound, bcryptedPassword, done) {
                var newUser = models.User.create({
                    email    : email,
                    username : username,
                    password : bcryptedPassword,
                    biography: biography,
                    isAdmin  : 0
                })
                    .then(function(newUser){
                        done(newUser);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'cannot add user'});
                    })
            }
        ],
            // Respond with the created user ID
            function (newUser) {
                if (newUser) {
                    return res.status(201).json({
                        'userId': newUser.id
                    });
                } else {
                    return res.status(500).json({'error': 'cannot add user'});
                }
            }
        );
    },
    login: function (req, res){

        var id       = req.body.id;
        var password = req.body.password;

        if (id === null && password === null) {
            return res.status(400).json({'error': 'missing parameters (id & password)'});
        } else if (id === null) {
            return res.status(400).json({'error': 'missing parameters (id)'});
        } else if (password === null) {
            return res.status(400).json({'error': 'missing parameters (password)'});
        }

        var loginRequest = {};

        if (EMAIL_REGEX.test(id)){
            loginRequest = { email: id };
        } else if (USERNAME_REGEX.test(id)) {
            loginRequest = { username: id };
        } else {
            return res.status(400).json({'error': 'incorrect id'});
        }

        // Login process
        asyncLib.waterfall([
            // Search if user exist with email or username
            function (done) {
                models.User.findOne({
                    where: loginRequest
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'unable to connect'});
                    })
            },
            // Check if user exist and compare crypted password
            function (userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if(resBycrypt) {
                            done(userFound);
                        } else {
                            return res.status(403).json({'error': 'invalid password'});
                        }
                    })
                } else {
                    return res.status(404).json({'error': 'user does not exist'});
                }
            }
        ],
            // Send response with user ID and token
            function (userFound) {
                return res.status(200).json({
                    'userId': userFound.id,
                    'token' : jwtUtils.generateTokenForUser(userFound)
                });
            }
        )
    },
    getUserProfil : function (req, res) {
        // Getting auth header
        var authHeader = req.headers['authorization'];
        var userId     = jwtUtils.getUserId(authHeader);

        if (userId < 0){
            return res.status(400).json({'error': 'wrong token'});
        }

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'biography'],
            where: {id:userId}
        })
            .then(function (user) {
                if (user) {
                    res.status(201).json(user);
                } else {
                    return res.status(404).json({'error': 'user not found'});
                }

            })
            .catch(function (err) {
                return res.status(500).json({'error': 'cannot fetch user'});
            })
    },
    updateUserProfile: function (req, res) {
        // Getting auth header
        var authHeader = req.headers['authorization'];
        var userId     = jwtUtils.getUserId(authHeader);

        // Fields
        var biography = req.body.biography;
        
        asyncLib.waterfall([
            // Get id and biography of the connected user
            function (done) {
                models.User.findOne({
                    attributes: ['id', 'biography'],
                    where: {id: userId}
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'unable to verify user'});
                    })
            },
            // Update the biography in the data base
            function (userFound, done){
                if (userFound) {
                    userFound.update({
                        biography: (biography ? biography : userFound.biography)
                    })
                        .then(function () {
                            done(userFound);
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'cannot update user profile'});
                        })
                } else {
                    return res.status(404).json({'error': 'user not found'});
                }
            }
        ],
            // Response with information of the connected user
            function (userFound) {
                return res.status(201).json({userFound});
            }
        )
    }
};