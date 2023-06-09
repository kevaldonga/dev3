'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userRelationCount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.profiles)
    }
  }
  userRelationCount.init({
    profileId: DataTypes.INTEGER,
    followings: DataTypes.INTEGER,
    followers: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 },
  }, {
    sequelize,
    modelName: 'userRelationCount',
  });
  return userRelationCount;
};