const app = require('express').Router();
const bodyParser = require('body-parser');
const { friendsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileUUID/followers - GET - get all followers of a user
*/
app.get("/:profileUUID/followers", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    let error = false;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const profileId = result.id;

    await friendsRelation.findAll({
        where: {
            "beingFollowedProfileId": profileId,
        },
        limit: 10,
        offset: offset,
        include: "followers",
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/following - GET - get all followings of a user
*/
app.get("/:profileUUID/followings", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    let error = false;

    result = await profiles.findOne({
        where: {
            uuid: profileUUID
        },
        attributes: ['id']
    })
        .catch((err) => {
            error = true;
            req.status(403).send(err.message);
        });

    if (error) return;

    const profileId = result.id;

    await friendsRelation.findAll({
        where: {
            "followerProfileId": {
                [Op.eq]: profileId,
            },
        },
        limit: 10,
        offset: offset,
        include: "followings"
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/follows/:beingFollowedProfileUUID - POST - user follows other user
* @check check active jwt, check if profile uuid matches
*/
app.post("/:profileUUID/follows/:beingFollowedProfileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const beingFollowedProfileUUID = req.params.beingFollowedProfileUUID;
    let error = false;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    const profileId = result.id;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: beingFollowedProfileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    const beingFollowedProfileId = result.id;


    // increment following count in a profile
    await profiles.increment("followings", {
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    // increment follower count in other profile
    await profiles.increment("followers", {
        where: {
            "profileId": {
                [Op.eq]: beingFollowedProfileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    // update friendsRelation table
    await friendsRelation.create({
        "beingFollowedProfileId": beingFollowedProfileId,
        "followerProfileId": profileId,
    })
        .then((result) => {
            res.send("followed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/follows/:beingFollowedProfileUUID - DELETE - user unfollows other user
* @check check active jwt, check if profile uuid matches
*/
app.delete("/:profileUUID/follows/:beingFollowedProfileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const beingFollowedProfileUUID = req.params.beingFollowedProfileUUID;
    let error = false;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    const profileId = result.id;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: beingFollowedProfileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    const beingFollowedProfileId = result.id;

    // decrement following count in a profile
    await profiles.decrement("followings", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    // decrement follower count in other a profile
    await profiles.decrement("followers", {
        by: 1, where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (err) return;

    // update friendsRelation table
    result = await friendsRelation.destroy({
        "followerProfileId": profileId,
        "beingFollowedProfileId": beingFollowedProfileId,
    })
        .then((result) => {
            res.send("unfollowed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;