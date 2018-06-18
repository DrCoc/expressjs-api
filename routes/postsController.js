// Imports
var models   = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

// Constants
const MESSAGE_LENGTH_LIMIT = 200;

// Routes
module.exports = {
    createPost: function (req, res) {
        // Getting auth header
        var authHeader = req.headers['authorization'];
        var userId     = jwtUtils.getUserId(authHeader);

        // Getting parameters
        var content = req.body.content;

        if (content == null && content.length <= MESSAGE_LENGTH_LIMIT) {
            return res.status(400).json({'error': 'invalid parameters'});
        }

        asyncLib.waterfall([
            // Getting user
            function (done) {
                models.User.findOne({
                    where: {id: userId}
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'unable to verify user'});
                    });
            },

            // Checking if userFound is valid
            function (userFound, done) {
                if (userFound) {
                    models.Post.create({
                        content: content,
                        like   : 0,
                        UserId : userFound.id
                    })
                        .then(function (newMessage) {
                            done(newMessage);
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'cannot create post'});
                        });
                } else {
                    return res.status(404).json({'error': 'user not found'});
                }
            }
        ],
            // Return the post
            function (newMessage) {
                if (newMessage){
                    return res.status(201).json(newMessage);
                } else {
                    return res.status(404).json({'error': 'cannot create post'});
                }
            }
        )
    },

    listPosts: function (req, res) {

        var fields = req.query.fields;
        var limit  = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);

        models.Post.findAll({
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit     : (!isNaN(limit)) ? limit : null,
            offset    : (!isNaN(offset)) ? offset : null,
            include   : [{
                model: models.User,
                attributes:['username']
            }]
        })
            .then(function (messages) {
                if (messages){
                    res.status(200).json(messages);
                } else {
                    res.status(404).json({'error': 'no message found'})
                }
            })
            .catch(function (err) {
                res.status(500).json({'error': 'invalid fields'})
            });

    }
};