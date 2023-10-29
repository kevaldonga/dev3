'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tagUserRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tagList, { foreignKey: "tagId", as: "tags" });
      this.belongsTo(models.profiles);
    }
  }
  tagUserRelation.init({
    tagId: { type: DataTypes.INTEGER, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  }, {
    sequelize,
    modelName: 'tagUserRelation',
  });
  return tagUserRelation;
};