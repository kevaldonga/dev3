'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.users);
      this.belongsToMany(models.posts, {
        through: 'bookmarkPostsRelation',
        foreignKey: 'postId'
      });
      this.belongsToMany(models.tagList, {
        through: 'tagUserRelation',
        foreignKey: 'tagId'
      });
      this.belongsToMany(models.tagList, {
        through: 'hashtagFollowers',
        foreignKey: 'hashtagId'
      });
      this.hasMany(models.posts);
    }
  }
  profiles.init({
    // followers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    // followings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    userId: { type: DataTypes.INTEGER, unique: true },
    profileImg: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.STRING, allowNull: true, validate: { len: [10, 255] } },
    uuid: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 }
  }, {
    sequelize,
    modelName: 'profiles',
  });
  return profiles;
};