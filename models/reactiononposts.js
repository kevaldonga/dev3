'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reactionOnPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  reactionOnPosts.init({
    reactionId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER,
    profileId: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 },
  }, {
    sequelize,
    modelName: 'reactionOnPosts',
  });
  return reactionOnPosts;
};