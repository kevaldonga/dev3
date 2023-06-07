const express = require('express');
const bodyParser = require('body-parser');

const { users } = require('./models');

const PORT = 5000;

let app = express();

app.use(bodyParser.json());


// to search user
app.post('/users/search', async (req, res) => {
    result = await users.findAll({ attributes: { exclude: ["uuid", "token", "password"] }, where: { "id": req.body.id } });
    res.send(result.length != 0 ? result : "user is not found!");
});


// to create user
app.post('/users/create', async (req, res) => {
    result = await users.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

// to update user
app.post('/users/', async (req, res) => {
    result = await users.update(req.body, {
        where: {
            id: req.body.id,
        }
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


// to get all users
app.get('/users/', async (req, res) => {
    result = await users.findAll({ attributes: { exclude: ["uuid", "token"] } });
    res.send({ users: result });
});


// to delete user
app.delete('/users/', async (req, res) => {
    result = await users.destroy({ where: { "id": req.body.id } });
    res.send(result ? "deleted successfully!!" : "error occured");
});

app.listen(PORT, () => { console.log('server is running...') });