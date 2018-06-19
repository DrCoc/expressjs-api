// Imports
var models   = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

// Constants

// Routes
module.exports = {
    votePost: function (req, res) {
        // Getting auth header
        var authHeader = req.headers['authorization'];
        var userId     = jwtUtils.getUserId(authHeader);

        // Parameters
        var postId = parseInt(req.params.postId);
        // TODO: Control postId var

        asyncLib.waterfall([
            function (done) {
                models.Post.findOne({
                    where: {id: postId}
                })
                    .then(function (postFound) {
                        done(null, postFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'unable to verify post'})
                    });
            },
            function (postFound, done) {
                if (postFound){
                    models.User.findOne({
                        where: {id: userId}
                    })
                        .then(function (userFound) {
                                done(null, postFound, userFound)
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'unable to verify user'})
                        })
                } else {
                    return res.status(404).json({'error': 'post not found'})
                }
            },
            function (postFound, userFound, done) {
                if (userFound){
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            postId: postId
                        }
                    })
                        .then(function (isUserAlreadyLiked) {
                            done(null, postFound, userFound, isUserAlreadyLiked)
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'unable to like/dislike the post'})
                        })
                } else{
                    return res.status(404).json({'error': 'user not found'})
                }
            },
            function (postFound, userFound, isUserAlreadyLiked, done) {
                if (!isUserAlreadyLiked){
                    postFound.addUser(userFound)
                        .then(function (alreadyLikedFound) {
                            done(null, postFound, isUserAlreadyLiked)
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'unable to like the post'});
                        })
                } else {
                    isUserAlreadyLiked.destroy()
                        .then(function () {
                            done(null, postFound, isUserAlreadyLiked);
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'unable to dislike the post'});
                        })
                }
            },
            function (postFound, isUserAlreadyLiked, done) {
                var increment = isUserAlreadyLiked ? -1 : 1;
                console.log(increment);
                postFound.update({
                    like: postFound.like + increment
                })
                    .then(function () {
                        done(postFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({'error': 'cannot update message like counter'});
                    })
            }
        ],
            function (likedPost) {
                return res.status(201).json(likedPost);
            })
    }
};