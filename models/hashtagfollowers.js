'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class hashtagFollowers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  hashtagFollowers.init({
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    hashtagId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 }
  }, {
    sequelize,
    modelName: 'hashtagFollowers',
  });
  return hashtagFollowers;
};