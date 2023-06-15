'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.reactions, {
        through: 'reactionOnComments',
        foreignKey: 'reactionId',
      });
      this.belongsToMany(models.profiles, {
        through: 'reactionOnComments',
        foreignKey: 'profileId',
      });
      this.hasMany(models.reactionsOnComments);
    }
  }
  comments.init({
    postId: DataTypes.INTEGER,
    profileId: DataTypes.INTEGER,
    reactionCount: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 },
  }, {
    sequelize,
    modelName: 'comments',
  });
  return comments;
};