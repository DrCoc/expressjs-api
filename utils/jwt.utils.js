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
    }
};