var jsonwebtoken = require('jsonwebtoken');
const JWT_SIGN_SECRET = 'b7GnGIYOedekbQFSt9Vr19IHRk4KSbhpGzSDEjnzR4FfGqskzZltx5zkHYdPlIuwgeUY7W4Q9l3XMUjAof9pAs29ZcNIxEjCxlae';
module.exports = {
    generateTokenForUser: function (userData) {
        return jsonwebtoken.sign({
            userId : userData.id,
            isAdmin: userData.isAdmin
        },
            JWT_SIGN_SECRET,
            {
                expiresIn: '1h'
            }
        )
    },
    parseAuthorization: function (authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function (authorisation) {
        var userId = -1;
        var token  = module.exports.parseAuthorization(authorisation);

        if (token != null) {
            try {
                var jwtToken = jsonwebtoken.verify(token, JWT_SIGN_SECRET);
                if (jwtToken != null){
                    userId = jwtToken.userId;
                }
            } catch (err) {

            }
            return userId;

        }
    }
};