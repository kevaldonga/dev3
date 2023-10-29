'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reactionModerators extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.users);
      this.belongsTo(models.profiles);
      this.belongsTo(models.reactions);
    }
  }
  reactionModerators.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    reactionId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'reactionModerators',
  });
  return reactionModerators;
};