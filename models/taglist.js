'use strict';
const {
  Model, Sequelize
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
    }
  }
  tagList.init({
    tag: { type: DataTypes.STRING, allowNull: false, validate: [5, 50] },
    // to check how many times hastag is used
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'tagList',
  });
  return tagList;
};