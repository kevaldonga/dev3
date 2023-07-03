'use strict';
const {
  Model, Sequelize
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
      // this.belongsTo(models.profiles, { foreignKey: "beingFollowedProfileId" });
    }
  }
  friendsRelation.init({
    followerProfileId: { type: DataTypes.INTEGER, allowNull: false },
    beingFollowedProfileId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false }
  }, {
    sequelize,
    modelName: 'friendsRelation',
  });
  return friendsRelation;
};