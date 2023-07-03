const app = require('express').Router();
const bodyParser = require('body-parser');
const { profiles, tagUserRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/*
* /:profileId - GET - get a user profile
* @check check active jwt, match profile uuid
*/
app.get('/:profileUUID', checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    });
    res.send(result);
});

/* 
* /:uuid - POST - create a user profile
*/
app.post('/:uuid', checkjwt, authorized, async (req, res) => {
    result = await profiles.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

/*
* /:profileUUID - PUT - update a user profile
* @check check active jwt
*/
app.put('/:profileUUID', checkjwt, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    result = await profiles.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


/*
* /:profileUUID - DELETE - delete a user profile by given uuid
* @check check active jwt
*/
app.delete('/:profileUUID', checkjwt, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    result = await profiles.destroy({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    });
    res.send(result ? "deleted successfully!!" : "error occured");
});


/*
* /:profileId/tags - GET - get all tags of profile
*/
app.get("/:profileId/tags", async (req, res) => {
    const profileId = req.params.profileId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await tagUserRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
        limit: 10,
        offset: offset,
        include: "tagList",
    });

    res.send(result);
});

/* 
* /:profileUUID/tags/:tagId - DELETE - delete tag inside profile
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:profileUUID/tags/:tagId", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagId = req.params.tagId;

    p = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = p.id;

    result = await tagUserRelation.destory({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
            "tagId": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag removed successfully!!" : "error occured");
});

module.exports = app;