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
    postId: DataTypes.INTEGER,
    profileId: DataTypes.INTEGER,
    reactionCount: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'comments',
  });
  return comments;
};