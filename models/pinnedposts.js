'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pinnedPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.profiles, { foreignKey: 'profileId', as: 'profilesOfPinnedPost' });
      this.belongsTo(models.posts, { foreignKey: 'postId', as: 'pinnedposts' });
    }
  }
  pinnedPosts.init({
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'pinnedPosts',
  });
  return pinnedPosts;
};