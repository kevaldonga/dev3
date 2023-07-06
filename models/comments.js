'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.reactions, {
        through: 'reactionOnComments',
      });
      this.belongsTo(models.profiles);
      this.belongsTo(models.posts);
    }
  }
  comments.init({
    // comment: { type: DataTypes.STRING, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    reactionCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'comments',
  });
  return comments;
};