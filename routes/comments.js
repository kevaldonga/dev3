const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID, addProfileId } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json());

/* 
* /:profileUUID - POST - create a comment
* @check check jwt signature,match profileuuid of url with payloadoad
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['comment', 'postId'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send(value);
    let error = false;

    const profileUUID = req.params.profileUUID;

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
        return res.status(409).send("invalid resource");
    }

    req.body.profileId = result.id;

    await comments.create(req.body)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err);
        });
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
                res.status(409).send("invalid resource");
            }
            else {
                res.send(result);
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:commentUUID - PUT - update a comment
* @check check jwt signature
*/
app.put("/:commentUUID", checkjwt, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['comment'], mustBeNullFields: [...defaultNullFields, 'postId', 'profileId', 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send(value);

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
                res.status(409).send("invalid resource");
            }
            else {
                res.send("SUCCESS");
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:commentUUID - DELETE - delete a comment
* @check check jwt signature
*/
app.delete("/:commentUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    await comments.destroy({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
                res.status(409).send("invalid resource");
            }
            else {
                res.send("SUCCESS");
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});


/*
* /:commentUUID/reactions - GET - get all reactions of comment
*/
app.get("/:commentUUID/reactions", async (req, res) => {
    const commentUUID = req.params.commentUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await comments.findOne({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
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
        return res.status(409).send("invalid resource");
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
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/*
* /:commentUUID/reaction/:reactionUUID - DELETE - delete a reaction on a comment
* @check check jwt signature
*/
app.delete("/:commentUUID/reaction/:reactionUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    const reactionUUID = req.params.reactionUUID;
    let error = false;

    result = await comments.findOne({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
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
        return res.status(409).send("invalid resource");
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
                res.status(409).send("invalid resource");
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