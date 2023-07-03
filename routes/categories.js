const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/*
* /:postId - GET - get category(s) of a post by postId 
* @check check active jwt
*/
app.get("/:postId", async (req, res) => {
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
* /:categoryUUID - DELETE - remove category of post by uuid
* @check check active jwt
*/
app.delete("/:categoryUUID", checkjwt, async (req, res) => {
    const categoryUUID = req.params.categoryUUID;

    result = await categorOfPost.destroy({
        where: {
            "uuid": {
                [Op.eq]: categoryUUID,
            },
        },
    });

    res.send(result ? "category removed !!" : "error occured");
});

/* 
* /:profileUUID - POST - create category
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {

    result = await categorOfPost.create(req.body);

    res.send(result ? "category created successfully !!" : "error occured");
});

/* 
* /:categoryId/all - GET - get all post of category
* @check check active jwt
*/
app.get("/:category/all", async (req, res) => {
    const category = req.params.category;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await categorOfPost.findAll({
        where: {
            "type": {
                [Op.eq]: category,
            },
        },
        limit: 10,
        offset: offset,
        include: "posts",
    });

    res.send(result);
});

module.exports = app;