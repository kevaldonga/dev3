const app = require('express').Router();
const { profiles, tagUserRelation } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/*
 * /:uuid - GET - get user profile
*/
app.get('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    let result = await profiles.findOne({
        where: {
            "uuid": {
                [Ops.eq]: uuid,
            },
        },
    });
    res.json(result);
});

/* 
* / - POST - create a user profile
*/
app.post('/', async (req, res) => {
    result = await profiles.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

/*
* /:uuid - PUT - update a user profile
*/
app.put('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    let result = await profiles.update(req.body, {
        where: {
            "uuid": {
                [Ops.eq]: uuid,
            },
        },
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


/*
* /:uuid - DELETE - delete a user profile by given uuid
*/
app.delete('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    result = await profiles.destroy({
        where: {
            "uuid": {
                [Ops.eq]: uuid,
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

    let result = await tagUserRelation.findAll({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:uuid/:tagId - DELETE - delete tag inside profile
*/
app.delete("/:uuid/:tagId", async (req, res) => {
    const uuid = req.params.uuid;
    const tagId = req.params.tagId;

    let result = await tagUserRelation.destory({
        where: {
            "uuid": {
                [Ops.eq]: uuid,
            },
            "tagId": {
                [Ops.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag removed successfully!!" : "error occured");
});

module.exports = app;