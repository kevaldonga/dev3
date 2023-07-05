const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost, posts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require("./validations/nullcheck");

app.use(bodyParser.json());

/*
* /:postUUID - GET - get category(s) of a post by postId 
* @check check active jwt
*/
app.get("/:postUUID", async (req, res) => {
    const postUUID = req.params.postUUID;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            }
        }
    });

    const postId = result.id;

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
    value = nullCheck(res, body, { nonNullableFields: ['type', 'postId'], mustBeNullFields: [...defaultNullFields] });
    if (value) return;

    result = await categorOfPost.create(req.body);

    res.send(result ? "category created successfully !!" : "error occured");
});

/* 
* /:categoryUUID/all - GET - get all post of category
* @check check active jwt
*/
app.get("/:categoryUUID/all", async (req, res) => {
    const categoryUUID = req.params.categoryUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await categorOfPost.findAll({
        where: {
            "uuid": {
                [Op.eq]: categoryUUID,
            },
        },
        limit: 10,
        offset: offset,
        include: "posts",
    });

    res.send(result);
});

module.exports = app;