'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("hashtagModerators", "profileId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    queryInterface.addColumn("reactionModerators", "profileId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("hashtagModerators", "profileId");
    queryInterface.removeColumn("reactionModerators", "profileId");
  }
};
