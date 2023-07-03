const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, addProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileId - POST - create a comment
* @check check active jwt, check if jwt matches request uri, get profileId from payload and add it req.nody
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, addProfileId, async (req, res) => {
    result = await comments.create(req.body);

    res.send(result ? "comment created successfully!!" : "error occured");
});
p
/* 
* /:id - GET - get a comment by id
* @check check active jwt
*/
app.get("/:commentId", checkjwt, async (req, res) => {
    const commentId = req.params.commentId;
    result = await comments.findOne({
        where: {
            "id": {
                [Op.eq]: commentId,
            },
        },
    });
    res.send(result);
});

/* 
* /:commentUUID - PUT - update a comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.put("/:commentUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    result = await comments.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    });
    res.send(result ? "comment updated successfully!!" : "error occured");
});

/* 
* /:commentUUID - DELETE - delete a comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:commentUUID", checkjwt, async (req, res) => {
    const commentUUID = req.params.commentUUID;
    result = await comments.destroy({
        where: {
            "uuid": {
                [Op.eq]: commentUUID,
            },
        },
    });
    res.send(result ? "comment deleted successfully!!" : "error occured");
});


/*
* /:commentId/reactions - GET - get all reactions of comment
*/
app.get("/:commentId/reactions", async (req, res) => {
    const commentId = req.params.commentId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
        },
        limit: 10,
        offset: offset,
    });

    res.send(result);
});

/*
* /:commentId/reaction/:reactionId - DELETE - delete a reaction on a comment
* @check check active jwt
*/
app.delete("/:commentId/reaction/:reactionUUID", checkjwt, async (req, res) => {
    const commentId = req.params.commentId;
    const reactionUUID = req.params.reactionUUID;
    result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured");
});

module.exports = app;