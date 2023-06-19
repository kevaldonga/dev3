'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bookmarkPostsRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.posts);
      this.belongsTo(models.profiles);
    }
  }
  bookmarkPostsRelation.init({
    postId: DataTypes.INTEGER,
    profileId: DataTypes.INTEGER,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'bookmarkPostsRelation',
  });
  return bookmarkPostsRelation;
};