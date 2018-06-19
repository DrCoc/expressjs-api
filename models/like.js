'use strict';
module.exports = (sequelize, DataTypes) => {
  var Like = sequelize.define('Like', {
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Post',
        key: 'id'
        }
      },
    userID: {
      type: DataTypes.INTEGER,
      references: {
          user: 'User',
          key: 'id'
      }
    }
  }, {});
  Like.associate = function(models) {
    // associations can be defined here
    models.User.belongsToMany(models.Post, {
      through: models.Like,
      foreignKey: 'userId',
      otherKey: 'postId'
    });

    models.Post.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'postId',
        otherKey: 'userId'
    });

    models.Like.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
    });

    models.Like.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
  };
  return Like;
};