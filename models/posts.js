'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.profiles, {
        through: 'bookmarkPostsRelation',
        foreignKey: 'profileId',
      });
      this.belongsToMany(models.tagList, {
        through: 'tagPostRelation',
        foreignKey: 'tagId',
      });
      this.belongsToMany(models.reactions, {
        through: 'reactionOnPosts',
        foreignKey: 'reactionId',
      });
    }
  }
  posts.init({
    profileId: DataTypes.INTEGER,
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.STRING,
    reactionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};