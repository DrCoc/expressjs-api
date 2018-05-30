'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    idUSERS: DataTypes.INTEGER,
    message: DataTypes.STRING,
    attachment: DataTypes.STRING,
    like: DataTypes.INTEGER
  }, {});
  Post.associate = function(models) {
    // associations can be defined here
      models.Post.belongsTo(models.User, {
        foreignKey : {
          allowNull: false
        }
      })
  };
  return Post;
};