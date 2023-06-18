const app = require('express').Router();
const { friendsRelation, userRelationCount } = require('../models');
const Ops = require('sequelize');

app.use(bodyParser.json());

/* 
* /:profileId - GET - get followers, following count of user
*/
app.get("/:profileId", (req, res) => {
    const profileId = req.params.profileId;

    let result = userRelationCount.findOne({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.json(result);
});

/* 
* /:profileId/followers - GET - get all followers of user
*/
app.get("/:profileId/followers", (req, res) => {
    const profileId = req.params.profileId;

    let result = friendsRelation.findAll({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.json(result);
});

/* 
* /:profileId/following - GET - get all followings of user
*/
app.get("/:profileId/followings", (req, res) => {
    const profileId = req.params.profileId;

    let result = friendsRelation.findAll({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.json(result);
});

/* 
* /:profileId/relations - POST - update on user follows other user
*/
app.post("/:profileId/relations", (req, res) => {
    const profileid = req.params.profileId;

    const followerProfileId = req.body.follower;
    const followingProfileId = req.body.following;

    // update friendsRelation table
    userRelationCount.create({
        "followingProfileId": followingProfileId,
        "followerProfileId": followerProfileId,
    });

    // increment  following count in profile

    // increment follower count in other profile

});

/* 
* /:profileId/relations - DELETE - delete on user follows other user
*/
app.post("/:profileId/relations", (req, res) => {
    const profileid = req.params.profileId;

    const followerProfileId = req.body.follower;
    const followingProfileId = req.body.following;

    // update friendsRelation table
    userRelationCount.destroy({
        "followingProfileId": followingProfileId,
        "followerProfileId": followerProfileId,
    });

    // decrement following count in profile

    // decrement follower count in other profile

});

module.exports = app;