const app = require('express').Router();
const bodyParser = require('body-parser');
const { profiles, tagUserRelation } = require('../models');
const { Op } = require('sequelize');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { checkjwt, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const getObj = require('./functions/include');
const { getUserState, updateUserState } = require('../redis/profileOp');

app.use(bodyParser.json());

/*
* /:profileId - GET - get a user profile
* @check check jwt signature, match profile uuid of url with payload
*/
app.get('/:profileUUID', checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;

    let result = await getUserState(profileUUID, 'id');

    if (result != 0) {
        return res.send({ res: result });
    }

    await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    })
        .then(async (result) => {
            if (result == null) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(profileUUID, result);
                res.send({ res: result });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:uuid - POST - create a user profile
*/
app.post('/:uuid', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['userId', 'name'], mustBeNullFields: [...defaultNullFields, 'followers', 'followings'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    await profiles.create(req.body)
        .then((result) => {
            res.send({ res: result });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/*
* /:profileUUID - PUT - update a user profile
* @check check jwt signature, match profile uuid of url with payload
*/
app.put('/:profileUUID', checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(req.body, { mustBeNullFields: [...defaultNullFields, 'followers', 'followings', 'userId'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const profileUUID = req.params.profileUUID;
    await profiles.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    })
        .then(async (result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(profileUUID, req.body);
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});


/*
* /:profileUUID - DELETE - delete a user profile by given uuid
* @check check jwt signature, match profileUUID with payload
*/
app.delete('/:profileUUID', checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    await profiles.destroy({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
    })
        .then((result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});


/*
* /:profileUUID/tags - GET - get all tags of profile
*/
app.get("/:profileUUID/tags", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        let result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        await tagUserRelation.findAll({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
            },
            limit: limit,
            offset: offset,
            include: "tags",
        })
            .then((result) => {
                res.send(getObj(result, "tags"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/tags/:tagUUID - POST - add tag inside profile
* @check check jwt signature, match profile uuid of url with payload
*/
app.post("/:profileUUID/tags/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.tagUUID;

    try {
        result = await tagList.findOne({
            where: {
                "uuid": {
                    [Op.eq]: tagUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const tagId = result.id;

        result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        // increment used count in taglist 
        await tagList.increment("count", {
            where: {
                "id": {
                    [Op.eq]: tagId,
                },
            }
        });

        await tagUserRelation.create({
            "profileId": profileId,
            "tagId": tagId,
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/tags/:tagUUID - DELETE - delete tag inside profile
* @check check jwt signature, match profile uuid of url with payload
*/
app.delete("/:profileUUID/tags/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.tagUUID;

    try {
        result = await tagList.findOne({
            where: {
                "uuid": {
                    [Op.eq]: tagUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const tagId = result.id;

        result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        // decrement used count in taglist 
        await tagList.decrement("count", {
            where: {
                "id": {
                    [Op.eq]: tagId,
                },
            }
        });

        await tagUserRelation.destory({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
                "tagId": {
                    [Op.eq]: tagId,
                },
            },
        })
            .then((result) => {
                if (result == undefined) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

module.exports = app;
