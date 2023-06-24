const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/*
* /:postId - GET - get category(s) of a post by postId 
* @check check active jwt
*/
app.get("/:postId", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    result = await categorOfPost.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:categoryId/profile/:profileId - DELETE - remove category of post by id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:categoryId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const categoryId = req.params.categoryId;

    result = await categorOfPost.destroy({
        where: {
            "id": {
                [Op.eq]: categoryId,
            },
        },
    });

    res.send(result ? "category removed !!" : "error occured");
});

/* 
* /:uuid - POST - create category
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    result = await categorOfPost.create(req.body);

    res.send(result ? "category created successfully !!" : "error occured");
});

/* 
* /:id/all - GET - get all post of category
* @check check active jwt
*/
app.post("/:postId/all", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    result = await categorOfPost.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

module.exports = app;