const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:profileId - CREATE - create comment
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    let result = comments.create(req.body);

    res.send(result ? "comment created successfully!!" : "error occured");
});

/* 
* /:id - GET - get comment by id
* @check check active jwt
*/
app.get("/:id", checkjwt, async (req, res) => {
    const id = req.params.id;
    let result = await comments.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result);
});

/* 
* /:id/:profileId - POST - update comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:id/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const id = req.params.id;
    let result = await comments.update(req.body, {
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result ? "comment updated successfully!!" : "error occured");
});

/* 
* /:id/:profileId - DELETE - delete comment by id
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:id/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const id = req.params.id;
    let result = await comments.destroy({
        where: {
            "id": {
                [Op.eq]: id,
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
    let result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
        },
    });

    res.send(result);
});

/*
* /:commentId/:reactionId - DELETE - delete reaction on comment
* @check check active jwt
*/
app.delete("/:commentId/:reactionId", checkjwt, async (req, res) => {
    const commentId = req.params.commentId;
    const reactionId = req.params.reactionId;
    let result = await reactionOnComments.findAll({
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