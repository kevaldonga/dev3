'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tagPostRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tagList, { foreignKey: "tagId", as: "tags" });
      this.belongsTo(models.posts);
    }
  }
  tagPostRelation.init({
    tagId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  }, {
    sequelize,
    modelName: 'tagPostRelation',
  });
  return tagPostRelation;
};