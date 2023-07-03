const app = require('express').Router();
const bodyParser = require('body-parser');
const { friendsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileId/followers - GET - get all followers of a user
* @check check active jwt
*/
app.get("/:profileId/followers", checkjwt, async (req, res) => {
    const profileId = req.params.profileId;
    result = await friendsRelation.findAll({
        where: {
            "beingFollowedProfileId": profileId,
        },
    });

    res.send(result);
});

/* 
* /:profileId/following - GET - get all followings of a user
* @check check active jwt
*/
app.get("/:profileId/followings", checkjwt, async (req, res) => {
    const profileId = req.params.profileId;

    result = await friendsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:profileId/follows/:beingFollowedProfileId - POST - user follows other user
* @check check active jwt
*/
app.post("/:profileId/follows/:beingFollowedProfileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;
    const beingFollowedProfileId = req.params.beingFollowedProfileId;

    // update friendsRelation table
    result = await friendsRelation.create({
        "beingFollowedProfileId": beingFollowedProfileId,
        "followerProfileId": profileId,
    });

    res.send(result ? "operation successful!!" : "error occured");

    // increment following count in a profile
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
* /:profileId/follows/:beingFollowedProfileId - DELETE - user unfollows other user
* @check check active jwt
*/
app.delete("/:profileId/follows/:beingFollowedProfileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;
    const beingFollowedProfileId = req.params.beingFollowedProfileId;

    // update friendsRelation table
    result = await friendsRelation.destroy({
        "followerProfileId": profileId,
        "beingFollowedProfileId": beingFollowedProfileId,
    });

    res.send(result ? "operation successful!!" : "error occured");

    // decrement following count in a profile
    await profiles.decrement("followings", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    });

    // decrement follower count in other a profile
    await profiles.decrement("followers", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    });

});

module.exports = app;