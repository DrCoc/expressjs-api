// Imports
var express = require('express');
var usersController = require('./routes/usersController');

// Router
exports.router = (function () {
    var router = express.Router();

    // Users routes
    router.route('/users/register/').post(usersController.register);
    router.route('/users/login/').post(usersController.login);

    return router;
})();