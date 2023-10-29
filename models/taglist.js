'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tagList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.posts, {
        through: 'tagPostRelation',
        foreignKey: 'postId',
      });
      this.belongsToMany(models.profiles, {
        through: 'tagUserRelation',
        foreignKey: 'profileId',
      });
      this.hasMany(models.hashtagModerators);
    }
  }
  tagList.init({
    tag: { type: DataTypes.STRING, allowNull: false, validate: { len: [5, 50] } },
    color: { type: DataTypes.CHAR(7), allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false, validate: { len: [10, 255] } },
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    followerCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  }, {
    sequelize,
    modelName: 'tagList',
  });
  return tagList;
};