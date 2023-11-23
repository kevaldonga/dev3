const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments, profiles, posts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID, addProfileId } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { getUserState, updateUserState } = require('../redis/profileOp');

app.use(bodyParser.json());

/* 
* /:profileUUID - POST - create a comment
* @check check jwt signature,match profileuuid of url with payloadoad
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['comment', 'postUUID'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const profileUUID = req.params.profileUUID;
    const postUUID = req.body.postUUID;

    try {
        let result = await getUserState(profileUUID);

        if (result == 0) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            await updateUserState(profileUUID, result);
        }
        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        req.body.profileId = result.id;

        postResult = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
        });

        if (postResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        req.body.postId = postResult.id;

        result = await comments.create(req.body);

        await posts.increment("commentCount", {
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
        });

        if (global.socket != null) {
            global.socket.emit(`posts:${postUUID}`, { "commentCount": postResult.commentCount + 1, "operation": "INCR", "id": result.id });
        }

        res.send({ res: result });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:id - GET - get a comment
*/
app.get("/:commentUUID", async (req, res) => {
    const commentUUID = req.params.commentUUID;

    await comments.findOne({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    })
        .then((result) => {
            if (result == null) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: result });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:commentUUID - PUT - update a comment
* @check check jwt signature
*/
app.put("/:commentUUID", checkjwt, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['comment'], mustBeNullFields: [...defaultNullFields, 'postId', 'profileId', 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const commentUUID = req.params.commentUUID;
    await comments.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
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
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:commentUUID - DELETE - delete a comment
* @check check jwt signature
*/
app.delete("/:commentUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    try {
        result = await comments.findOne({
            where: {
                "uuid": {
                    [Op.eq]: commentUUID,
                },
            },
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.postId;
        const commentId = result.id;

        postResult = await posts.findOne({
            where: {
                "id": {
                    [Op.eq]: postId,
                },
            },
        });

        if (postResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        await posts.decrement("commentCount", {
            where: {
                "id": {
                    [Op.eq]: postId,
                },
            },
        });

        if (global.socket != null) {
            global.socket.emit(`posts:${postResult.uuid}`, { "commentCount": postResult.commentCount - 1, "operation": "DECR", "id": commentId });
        }

        result = await comments.destroy({
            where: {
                "uuid": {
                    [Op.eq]: commentUUID,
                },
            },
        });

        if (result == 0) {
            res.status(409).send({ error: true, res: "Invalid resource" });
        }

        res.send({ res: "SUCCESS" });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message });
    };
});


/*
* /:commentUUID/reactions - GET - get all reactions of comment
*/
app.get("/:commentUUID/reactions", async (req, res) => {
    const commentUUID = req.params.commentUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await comments.findOne({
            where: {
                "uuid": {
                    [Op.eq]: commentUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const commentId = result.id;

        await reactionOnComments.findAll({
            where: {
                "commentId": {
                    [Op.eq]: commentId,
                },
            },
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send({ res: result });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/*
* /:commentUUID/reaction/:reactionUUID - DELETE - delete a reaction on a comment
* @check check jwt signature
*/
app.delete("/:commentUUID/reaction/:reactionUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    const reactionUUID = req.params.reactionUUID;

    try {
        result = await comments.findOne({
            where: {
                "uuid": {
                    [Op.eq]: commentUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const commentId = result.id;

        await reactionOnComments.destroy({
            where: {
                "commentId": {
                    [Op.eq]: commentId,
                },
                "uuid": {
                    [Op.eq]: reactionUUID,
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
