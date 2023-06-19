'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.comments, {
        through: 'reactionOnComments',
        foreignKey: 'commentId',
      });
      this.belongsToMany(models.posts, {
        through: 'reactionOnPosts',
        foreignKey: 'postId',
      });
    }
  }
  reactions.init({
    reaction: { type: DataTypes.CHAR, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'reactions',
  });
  return reactions;
};