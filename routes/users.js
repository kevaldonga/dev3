const app = require('express').Router();
const { users } = require('../models');

app.use(bodyParser.json());

/*
 * /:uuid - GET - get user
*/
app.get('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    let person = await users.findOne({
        where: {
            uuid: uuid,
        }
    })
    res.json(person);
});

/* 
* / - POST - create a user
*/
app.post('/', async (req, res) => {
    result = await users.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

/*
* /:uuid - PUT - update a user
*/
app.put('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    result = await users.update(req.body, {
        where: {
            "uuid": uuid,
        }
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


/*
* /:uuid - DELETE - delete a user by given uuid
*/
app.delete('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    result = await users.destroy({ where: { "uuid": uuid } });
    res.send(result ? "deleted successfully!!" : "error occured");
});

/*
* /resource - POST - create
* /resource - GET - List
* /parent-resource/:parentresourceId/:childresource - POST - Create - params
* /resource/:reference - GET - findOne - single collection
* /resource/:reference - PUT - update
* /resource/:reference - DELETE - delete
* /resource/:reference - POST - Nothing

* PATCH - PUT
*/

module.exports = app;