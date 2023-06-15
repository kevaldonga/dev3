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
      this.hasMany(models.tagPostRelation);
      this.hasMany(models.taguserRelation);
    }
  }
  tagList.init({
    tag: { type: DataTypes.STRING, allowNull: false },
    count: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 },
  }, {
    sequelize,
    modelName: 'tagList',
  });
  return tagList;
};