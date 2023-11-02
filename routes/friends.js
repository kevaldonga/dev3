const app = require('express').Router();
const bodyParser = require('body-parser');
const { friendsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const getObj = require('./functions/include');
const { checkjwt, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileUUID/followers - GET - get all followers of a user
*/
app.get("/:profileUUID/followers", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const profileId = result.id;

        await friendsRelation.findAll({
            where: {
                "beingFollowedProfileId": profileId,
            },
            limit: limit,
            offset: offset,
            include: "followers",
        })
            .then((result) => {
                res.send(getObj(result, "followers"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/following - GET - get all followings of a user
*/
app.get("/:profileUUID/followings", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await profiles.findOne({
            where: {
                uuid: profileUUID
            },
            attributes: ['id']
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const profileId = result.id;

        await friendsRelation.findAll({
            where: {
                "followerProfileId": {
                    [Op.eq]: profileId,
                },
            },
            limit: limit,
            offset: offset,
            include: "followings",
        })
            .then((result) => {
                res.send(getObj(result, "followings"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/follows/:beingFollowedProfileUUID - POST - user follows other user
* @check check jwt signature, match profileuuid of url with payload
*/
app.post("/:profileUUID/follows/:beingFollowedProfileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const beingFollowedProfileUUID = req.params.beingFollowedProfileUUID;

    try {
        profileResult = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
        });

        if (profileResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const profileId = profileResult.id;

        followedProfileResult = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: beingFollowedProfileUUID,
                },
            },
        });

        if (followedProfileResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const beingFollowedProfileId = followedProfileResult.id;

        result = await friendsRelation.findOne({
            where: {
                "followerProfileId": {
                    [Op.eq]: profileId,
                },
                "beingFollowedProfileId": {
                    [Op.eq]: beingFollowedProfileId,
                }
            }
        });

        if (result != null) {
            return res.status(403).send({ error: true, res: "user already followed" });
        }

        // increment following count in a profile
        await profiles.increment("followings", {
            where: {
                "id": {
                    [Op.eq]: profileId,
                },
            }
        });

        if (global.socket != undefined) {
            global.socket.emit(`profile:${profileUUID}:followings`, { "followings": profileResult.followings + 1, "operation": "INCR" });
        }

        // increment follower count in other profile
        await profiles.increment("followers", {
            where: {
                "id": {
                    [Op.eq]: beingFollowedProfileId,
                },
            }
        });

        if (global.socket != undefined) {
            global.socket.emit(`profile:${beingFollowedProfileUUID}:followers`, { "followers": followedProfileResult.followers + 1, "operation": "INCR" });
        }

        // update friendsRelation table
        await friendsRelation.create({
            "beingFollowedProfileId": beingFollowedProfileId,
            "followerProfileId": profileId,
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/unfollows/:beingFollowedProfileUUID - DELETE - user unfollows other user
* @check check jwt signature, match profile uuid of url with payload
*/
app.delete("/:profileUUID/unfollows/:beingFollowedProfileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const beingFollowedProfileUUID = req.params.beingFollowedProfileUUID;

    try {
        profileResult = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
        });

        if (profileResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const profileId = profileResult.id;

        followedProfileResult = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: beingFollowedProfileUUID,
                },
            },
        });

        if (followedProfileResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const beingFollowedProfileId = followedProfileResult.id;

        result = await friendsRelation.findOne({
            where: {
                "followerProfileId": {
                    [Op.eq]: profileId,
                },
                "beingFollowedProfileId": {
                    [Op.eq]: beingFollowedProfileId,
                }
            }
        });

        if (result == null) {
            return res.status(403).send({ error: true, res: "user already not followed" });
        }

        // decrement following count in a profile
        await profiles.decrement("followings", {
            where: {
                "id": {
                    [Op.eq]: profileId,
                },
            }
        });

        if (global.socket != undefined) {
            global.socket.emit(`profile:${profileUUID}:followings`, { "followings": profileResult.followings - 1, "operation": "DECR", "id": result.id });
        }

        // decrement follower count in other a profile
        await profiles.decrement("followers", {
            where: {
                "id": {
                    [Op.eq]: beingFollowedProfileId,
                },
            }
        });

        if (global.socket != undefined) {
            global.socket.emit(`profile:${beingFollowedProfileId}:followers`, { "followers": followedProfileResult.followers - 1, "operation": "DECR", "id": result.id });
        }

        // update friendsRelation table
        result = await friendsRelation.destroy({
            where: {
                "followerProfileId": {
                    [Op.eq]: profileId,
                },
                "beingFollowedProfileId": {
                    [Op.eq]: beingFollowedProfileId,
                },
            },
        })
            .then((result) => {
                if (result == 0) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

module.exports = app;