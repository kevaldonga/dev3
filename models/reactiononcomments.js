'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reactionOnComments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.reactions);
      this.belongsTo(models.comments);
      this.belongsTo(models.profiles);
    }
  }
  reactionOnComments.init({
    reactionId: { type: DataTypes.INTEGER, allowNull: false },
    commentId: { type: DataTypes.INTEGER, allowNull: false },
    profileId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  }, {
    sequelize,
    modelName: 'reactionOnComments',
  });
  return reactionOnComments;
};