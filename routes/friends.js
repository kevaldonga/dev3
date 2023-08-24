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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
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
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:profileUUID/following - GET - get all followings of a user
*/
app.get("/:profileUUID/followings", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await profiles.findOne({
        where: {
            uuid: profileUUID
        },
        attributes: ['id']
    })
        .catch((err) => {
            error = true;
            req.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
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
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:profileUUID/follows/:beingFollowedProfileUUID - POST - user follows other user
* @check check jwt signature, match profileuuid of url with payload
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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
    }

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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
    }

    const beingFollowedProfileId = result.id;

    // increment following count in a profile
    await profiles.increment("followings", {
        where: {
            "id": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (result == null) {
        return res.status(409).send("Invalid resource");
    }

    if (error) return;

    // increment follower count in other profile
    await profiles.increment("followers", {
        where: {
            "id": {
                [Op.eq]: beingFollowedProfileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    // update friendsRelation table
    await friendsRelation.create({
        "beingFollowedProfileId": beingFollowedProfileId,
        "followerProfileId": profileId,
    })
        .then((result) => {
            res.send("SUCCESS");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:profileUUID/follows/:beingFollowedProfileUUID - DELETE - user unfollows other user
* @check check jwt signature, match profile uuid of url with payload
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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
    }

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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("Invalid resource");
    }

    const beingFollowedProfileId = result.id;

    // decrement following count in a profile
    await profiles.decrement("followings", {
        where: {
            "id": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    // decrement follower count in other a profile
    await profiles.decrement("followers", {
        where: {
            "id": {
                [Op.eq]: profileId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

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
                res.status(409).send("Invalid resource");
            }
            else {
                res.send("SUCCESS");
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

module.exports = app;