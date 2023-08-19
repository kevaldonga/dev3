const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost, posts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require("./validations/nullcheck");
const getObj = require('./functions/include');

app.use(bodyParser.json());

/*
* /:postUUID - GET - get category(s) of a post by postId 
* @check check jwt singnature
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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("invalid resource");
    }

    const postId = result.id;

    await categorOfPost.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
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
* /:categoryUUID - DELETE - remove category of post by uuid
* @check check jwt signature
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
* /:profileUUID - POST - create category
* @check check jwt signature, match profileuuid of url with payload
*/
app.post("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['type', 'postId'], mustBeNullFields: [...defaultNullFields] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await categorOfPost.create(req.body)
        .then((result) => {
            res.send("SUCCESS");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:categoryUUID/all - GET - get all post of category
*/
app.get("/:categoryUUID/all", async (req, res) => {
    const categoryUUID = req.params.categoryUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    await categorOfPost.findAll({
        where: {
            "uuid": {
                [Op.eq]: categoryUUID,
            },
        },
        limit: limit,
        offset: offset,
        include: "posts",
    })
        .then((result) => {
            res.send(getObj(result, "posts"));
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

module.exports = app;