'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM('user', 'admin', 'moderator'),
      allowNull: false,
      defaultValue: 'user',
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("users", "role");
  }
};
