const app = require('express').Router();
const bodyParser = require('body-parser');
const { profiles, tagUserRelation, userRelationCount } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/*
* /:profileId - GET - get user profile
* @check check active jwt
*/
app.get('/:profileId', checkjwt, authorizedForProfileId, async (req, res) => {
    const uuid = req.params.uuid;
    let result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result);
});

/* 
* / - POST - create a user profile
*/
app.post('/', async (req, res) => {
    result = await profiles.create(req.body).then(async (user) => {
        const id = user.id;
        await userRelationCount.create({ "profileId": id });
    });
    res.send(result ? "created successfully!!" : "error occured");
});

/*
* /:uuid - PUT - update a user profile
* @check check active jwt, check if jwt matches request uri
*/
app.put('/:uuid', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    let result = await profiles.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


/*
* /:uuid - DELETE - delete a user profile by given uuid
* @check check active jwt, check if jwt matches request uri
*/
app.delete('/:uuid', checkjwt, authorized, async (req, res) => {
    const uuid = req.params.uuid;
    result = await profiles.destroy({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result ? "deleted successfully!!" : "error occured");
});


/*
* /:profileId/tags - GET - get all tags of profile
* @check check active jwt
*/
app.get("/:profileId/tags", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;

    let result = await tagUserRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:profileId/:tagId - DELETE - delete tag inside profile
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:profileId/:tagId", checkjwt, authorizedForProfileId, async (req, res) => {
    const uuid = req.params.uuid;
    const tagId = req.params.tagId;

    let result = await tagUserRelation.destory({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
            "tagId": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag removed successfully!!" : "error occured");
});

module.exports = app;