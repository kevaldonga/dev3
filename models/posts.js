'use strict';
const {
  Model
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
      this.hasMany(models.comments);
    }
  }
  posts.init({
    media: { type: DataTypes.STRING, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false, validate: { len: [5, 100] } },
    description: { type: DataTypes.STRING, allowNull: true, validate: { len: [10, 255] } },
    readDuration: { type: DataTypes.DATE, allowNull: false },
    reactionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};