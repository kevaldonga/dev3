const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileId - CREATE - create a comment
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    result = await comments.create(req.body);

    res.send(result ? "comment created successfully!!" : "error occured");
});

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
* /:commentId/profile/:profileId - POST - update a comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:commentId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const commentId = req.params.id;
    result = await comments.update(req.body, {
        where: {
            "id": {
                [Op.eq]: commentId,
            },
        },
    });
    res.send(result ? "comment updated successfully!!" : "error occured");
});

/* 
* /:commentId/profile/:profileId - DELETE - delete a comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:commentId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const commentId = req.params.commentId;
    result = await comments.destroy({
        where: {
            "id": {
                [Op.eq]: commentId,
            },
        },
    });
    res.send(result ? "comment deleted successfully!!" : "error occured");
});


/*
* /:commentId/reactions - GET - get all reactions of comment
* @check check active jwt
*/
app.get("/:commentId/reactions", checkjwt, async (req, res) => {
    const commentId = req.params.commentId;
    result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
        },
    });

    res.send(result);
});

/*
* /:commentId/reaction/:reactionId - DELETE - delete a reaction on a comment
* @check check active jwt
*/
app.delete("/:commentId/reaction/:reactionId", checkjwt, async (req, res) => {
    const commentId = req.params.commentId;
    const reactionId = req.params.reactionId;
    result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
            "reactionId": {
                [Op.eq]: reactionId,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured");
});

module.exports = app;