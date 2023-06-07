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
      // define association here
    }
  }
  tagPostRelation.init({
    tag_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    uuid: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'tagPostRelation',
  });
  return tagPostRelation;
};