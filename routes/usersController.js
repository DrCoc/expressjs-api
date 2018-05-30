// Imports
var bcrypt   = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models   = require('../models');

// Routes
module.exports = {
    register: function (req, res){
        // Parameters
        var email     = req.body.email;
        var username  = req.body.username;
        var password  = req.body.password;
        var biography = req.body.biography;

        if (email == null || username == null || password == null ){
            return res.status(400).json({'error': 'missing parameters'});
        }

        // TODO : verify data lenght / regex and create errors

        models.User.findOne({
            attributes: ['email', 'username'],
            where: {
                $or : [{email: email}, {username: username}]
            }
        })
            .then(function (userFound) {
                if (!userFound) {

                    // TODO : check email and password regex

                    bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                        var newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptedPassword,
                            biography: biography,
                            isAdmin: 0
                        })
                            .then(function(newUser){
                                return res.status(201).json({'userId': newUser.id});
                        })
                            .catch(function (err) {
                                return res.status(500).json({'error': 'cannot add user'});
                            })
                    });
                } else {
                    console.log(userFound.email, userFound.username);
                    if (userFound.email == email && userFound.username == username) {
                        return res.status(409).json({'error': 'user already exist (email & username)'});
                    } else if (userFound.email === email) {
                        return res.status(409).json({'error': 'user already exist (email)'});
                    } else if (userFound.username === username) {
                        return res.status(409).json({'error': 'user already exist (username)'});
                    } else {
                        return res.status(409).json({'error': 'user already exist'});
                    }

                }
            })
            .catch(function (err) {
                return res.status(500).json({'error': 'unable to verify user'});
            })

    },
    login: function (req, res){

        var email = req.body.email;
        var password = req.body.password;

        if (email === null || password === null) {
            return res.status(400).json({'error': 'missing parameters'});
        }
            // TODO : check email and password regex

        models.User.findOne({
            where: {email: email}
        })
            .then(function (userFound) {
                if (userFound){
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if(resBycrypt) {
                            return res.status(200).json({
                                'userId': userFound.id,
                                'token' : jwtUtils.generateTokenForUser(userFound)
                            });
                        } else {
                            return res.status(403).json({'error': 'invalid password'});
                        }
                    })
                } else {
                    return res.status(404).json({'error': 'user does not exist'});
                }
            })
            .catch(function (err) {
                return res.status(500).json({'error': 'unable to verify user'});
            })
    }
};