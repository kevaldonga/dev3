'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reactionOnPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.reactions);
      this.belongsTo(models.posts);
      this.belongsTo(models.profiles);
    }
  }
  reactionOnPosts.init({
    reactionId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'reactionOnPosts',
  });
  return reactionOnPosts;
};