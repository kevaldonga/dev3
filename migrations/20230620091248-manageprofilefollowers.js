'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // followers
    queryInterface.addColumn("profiles", "followers", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    // followings
    queryInterface.addColumn("profiles", "followings", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // drop table
    queryInterface.dropTable("userRelationCounts");
  },

  async down(queryInterface, Sequelize) {
    // followers
    queryInterface.removeColumn("profiles", "followers");
    // followings
    queryInterface.removeColumn("profiles", "followings");

    // drop table
    queryInterface.createTable("userRelationCounts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profileId: {
        type: Sequelize.INTEGER
      },
      followings: {
        type: Sequelize.INTEGER
      },
      followers: {
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  }
};
