const app = require('express').Router();
const { users } = require('../models');

app.post('/search', async (req, res) => {
    result = await users.findAll({ attributes: { exclude: ["uuid", "token", "password"] }, where: { "id": req.body.id } });
    res.send(result.length != 0 ? result : "user is not found!");
});


// to create user
app.post('/create', async (req, res) => {
    result = await users.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

// to update user
app.post('/', async (req, res) => {
    result = await users.update(req.body, {
        where: {
            id: req.body.id,
        }
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


// to get all users
app.get('/', (req, res) => {
    console.log('now going to await');
    users.findAll({ attributes: { exclude: ["uuid", "token"] } })
        .then(resfromdb => res.send({ users: resfromdb }));
    console.log('await finished');
    console.log('sending back');
    console.log('sending finished');
});
// app.get('/', async (req, res) => {
//     console.log('now going to await');
//     result = await users.findAll({ attributes: { exclude: ["uuid", "token"] } });
//     console.log('await finished');
//     console.log('sending back');
//     res.send({ users: result });
//     console.log('sending finished');
// });


// to delete user
app.delete('/', async (req, res) => {
    result = await users.destroy({ where: { "id": req.body.id } });
    res.send(result ? "deleted successfully!!" : "error occured");
});

module.exports = app;