const { createClient } = require('redis');

const client = createClient();

const connect = async () => await client.connect();

const updateUserState = async (uuid, isActive) => {
    connect();

    await client.set(uuid, isActive);
};

const getUserState = async (uuid) => {
    const result = await client.get(uuid);

    return result == null ? 0 : result;
};

module.exports = { updateUserState: updateUserState, getUserState: getUserState };