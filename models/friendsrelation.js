'use strict';
const {
  Model, UUIDV4
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class friendsRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.profiles, { foreignKey: "followerProfileId" });
      this.belongsTo(models.profiles, { foreignKey: "followingProfileId" });
    }
  }
  friendsRelation.init({
    followingProfileId: DataTypes.INTEGER,
    followerProfileId: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 }
  }, {
    sequelize,
    modelName: 'friendsRelation',
  });
  return friendsRelation;
};