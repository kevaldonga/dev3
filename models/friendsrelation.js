'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class friendsRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.profiles, { foreignKey: "followerProfileId", as: "followers" });
      this.belongsTo(models.profiles, { foreignKey: "beingFollowedProfileId", as: "followings" });
    }
  }
  friendsRelation.init({
    followerProfileId: { type: DataTypes.INTEGER, allowNull: false },
    beingFollowedProfileId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false }
  }, {
    sequelize,
    modelName: 'friendsRelation',
  });
  return friendsRelation;
};