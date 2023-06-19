const app = require('express').Router();
const bodyParser = require('body-parser');
const { friendsRelation, userRelationCount } = require('../models');
const Ops = require('sequelize');

app.use(bodyParser.json());

/* 
* /:profileId - GET - get followers, following count of user
*/
app.get("/:profileId", async (req, res) => {
    const profileId = req.params.profileId;

    let result = await userRelationCount.findOne({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.send(result);
});

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
                [Ops.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:profileId/relations - POST - update on user follows other user
*/
app.post("/:profileId/relations", async (req, res) => {
    const profileid = req.params.profileId;

    const followerProfileId = req.body.follower;
    const beingFollowedProfileId = req.body.beingFollowedProfileId;

    // update friendsRelation table
    await userRelationCount.create({
        "beingFollowedProfileId": beingFollowedProfileId,
        "followerProfileId": followerProfileId,
    });

    // increment  following count in profile
    await userRelationCount.increment("followerProfileId", {
        by: 1, where: {
            "profileId": {
                [Ops.eq]: profileid,
            },
        }
    });

    // increment follower count in other profile
    await userRelationCount.increment("beingFollowedProfileId", {
        by: 1, where: {
            "profileId": {
                [Ops.eq]: beingFollowedProfileId,
            },
        }
    });

});

/* 
* /:profileId/relations - DELETE - delete on user follows other user
*/
app.put("/:profileId/relations", async (req, res) => {
    const profileid = req.params.profileId;

    const followerProfileId = req.body.follower;
    const beingFollowedProfileId = req.body.beingFollowedProfileId;

    // update friendsRelation table
    await userRelationCount.destroy({
        "followingProfileId": followingProfileId,
        "beingFollowedProfileId": beingFollowedProfileId,
    });

    // decrement following count in profile
    await userRelationCount.decrement("followingProfileCount", {
        by: 1, where: {
            "profileId": {
                [Ops.eq]: profileid,
            },
        }
    });

    // decrement follower count in other profile
    await userRelationCount.decrement("beingFollowedProfileId", {
        by: 1, where: {
            "profileId": {
                [Ops.eq]: beingFollowedProfileId,
            },
        }
    });

});

module.exports = app;