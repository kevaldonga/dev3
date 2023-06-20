const app = require('express').Router();
const bodyParser = require('body-parser');
const { friendsRelation, profiles } = require('../models');
const { Op } = require('sequelize');

app.use(bodyParser.json());

/* 
* /:profileId/followers - GET - get all followers of user
*/
app.get("/:profileId/followers", async (req, res) => {
    const profileId = req.params.profileId;
    let result = await friendsRelation.findAll({
        where: {
            "beingFollowedProfileId": profileId,
        },
    });

    res.send(result);
});

/* 
* /:profileId/following - GET - get all followings of user
*/
app.get("/:profileId/followings", async (req, res) => {
    const profileId = req.params.profileId;

    let result = await friendsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:profileId/relations - POST - update on user follows other user
*/
app.post("/:profileId/relations", async (req, res) => {
    const profileId = req.params.profileId;

    const followerProfileId = req.body.followerProfileId;
    const beingFollowedProfileId = req.body.beingFollowedProfileId;

    // update friendsRelation table
    let result = await friendsRelation.create({
        "beingFollowedProfileId": beingFollowedProfileId,
        "followerProfileId": followerProfileId,
    });

    res.send(result);

    // increment  following count in profile
    await profiles.increment("followings", {
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    });

    // increment follower count in other profile
    await profiles.increment("followers", {
        where: {
            "profileId": {
                [Op.eq]: beingFollowedProfileId,
            },
        }
    });

});

/* 
* /:profileId/relations - DELETE - delete on user follows other user
*/
app.delete("/:profileId/relations", async (req, res) => {
    const profileid = req.params.profileId;

    const followerProfileId = req.body.follower;
    const beingFollowedProfileId = req.body.beingFollowedProfileId;

    // update friendsRelation table
    await friendsRelation.destroy({
        "followerProfileId": followerProfileId,
        "beingFollowedProfileId": beingFollowedProfileId,
    });

    // decrement following count in profile
    await profiles.decrement("followings", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: profileid,
            },
        }
    });

    // decrement follower count in other profile
    await profiles.decrement("followers", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: beingFollowedProfileId,
            },
        }
    });

});

module.exports = app;