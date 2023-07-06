const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID, addProfileId } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json());

/* 
* /:profileUUID - POST - create a comment
* @check check active jwt, check if jwt matches request uri, get profileId from payload and add it req.nody
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['comment', 'postId'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
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
            res.status(403).send(err.message);
        });

    if (error) return;

    req.body.profileId = result.id;

    await comments.create(req.body)
        .then((result) => {
            res.send("comment created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:id - GET - get a comment by id
* @check check active jwt
*/
app.get("/:commentUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    await comments.findOne({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:commentUUID - PUT - update a comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.put("/:commentUUID", checkjwt, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['comment'], mustBeNullFields: [...defaultNullFields, 'postId', 'profileId', 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const commentUUID = req.params.commentUUID;
    await comments.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    })
        .then((result) => {
            res.send("comment updated successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:commentUUID - DELETE - delete a comment by id
* @check check active jwt, check if jwt matches request uri
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
            res.send("comment deleted successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});


/*
* /:commentUUID/reactions - GET - get all reactions of comment
*/
app.get("/:commentUUID/reactions", async (req, res) => {
    const commentUUID = req.params.commentUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
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
            res.status(403).send(err.message);
        });

    if (err) return;


    const commentId = result.id;

    await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
        },
        limit: 10,
        offset: offset,
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /:commentUUID/reaction/:reactionUUID - DELETE - delete a reaction on a comment
* @check check active jwt
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
            res.status(403).send(err.message);
        });

    if (err) return;

    const commentId = result.id;

    await reactionOnComments.findAll({
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
            res.send("reaction removed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;