// Imports
var express = require('express');
var usersController = require('./routes/usersController');
var postsController = require('./routes/postsController');

// Router
exports.router = (function () {
    var router = express.Router();

    // Users routes
    router.route('/users/register/').post(usersController.register);
    router.route('/users/login/').post(usersController.login);
    router.route('/users/profile/').get(usersController.getUserProfil);
    router.route('/users/profile/').put(usersController.updateUserProfile);

    // Post routes
    router.route('/posts/create/').post(postsController.createPost);
    router.route('/posts/').get(postsController.listPosts);

    return router;
})();