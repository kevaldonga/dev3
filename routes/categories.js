const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost, posts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require("./validations/nullcheck");

app.use(bodyParser.json());

/*
* /:postUUID - GET - get category(s) of a post by postId 
* @check check active jwt
*/
app.get("/:postUUID", async (req, res) => {
    const postUUID = req.params.postUUID;
    let error = false;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            }
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const postId = result.id;

    await categorOfPost.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
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
* /:categoryUUID - DELETE - remove category of post by uuid
* @check check active jwt
*/
app.delete("/:categoryUUID", checkjwt, async (req, res) => {
    const categoryUUID = req.params.categoryUUID;

    await categorOfPost.destroy({
        where: {
            "uuid": {
                [Op.eq]: categoryUUID,
            },
        },
    })
        .then((result) => {
            res.send("category removed");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID - POST - create category
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['type', 'postId'], mustBeNullFields: [...defaultNullFields] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await categorOfPost.create(req.body)
        .then((result) => {
            res.send("category created successfully !!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:categoryUUID/all - GET - get all post of category
* @check check active jwt
*/
app.get("/:categoryUUID/all", async (req, res) => {
    const categoryUUID = req.params.categoryUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    await categorOfPost.findAll({
        where: {
            "uuid": {
                [Op.eq]: categoryUUID,
            },
        },
        limit: 10,
        offset: offset,
        include: "posts",
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;