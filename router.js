// Imports
var express = require('express');
var usersController = require('./routes/usersController');
var WSDLController = require('./routes/WSDLController');

// Router
exports.router = (function () {
    var router = express.Router();

    // Users routes
    router.route('/users/register/').post(usersController.register);
    router.route('/users/login/').post(usersController.login);
    router.route('/users/profile/').get(usersController.getUserProfil);
    router.route('/users/profile/').put(usersController.updateUserProfile);

    // WSDL routes
    router.route('/wsdl/get-emp/').post(WSDLController.getEmp);

    return router;
})();