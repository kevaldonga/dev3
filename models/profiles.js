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
    userId: { type: DataTypes.INTEGER, unique: true },
    profileImg: DataTypes.STRING,
    name: { type: DataTypes.STRING, allowNull: false },
    bio: DataTypes.STRING,
    uuid: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 }
  }, {
    sequelize,
    modelName: 'profiles',
  });
  return profiles;
};