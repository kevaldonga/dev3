'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userRelationCount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.profiles);
      this.hasMany(models.friendsRelation);
    }
  }
  userRelationCount.init({
    profileId: DataTypes.INTEGER,
    followings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    followers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'userRelationCount',
  });
  return userRelationCount;
};