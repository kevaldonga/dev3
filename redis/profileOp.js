const Redis = require('ioredis');
const JSONCache = require('redis-json');

const redis = new Redis();
const jsonCache = new JSONCache(redis);

const updateUserState = async (uuid, data) => {
    await jsonCache.set(uuid, data);
};

const getUserState = async (uuid, ...extraFields) => {
    return await redis.get(uuid, ...extraFields);
};

const updateUUID = async (oldUUID, newUUID) => {
    let result = await jsonCache.get(oldUUID);

    if (result == null) return;

    await jsonCache.set(newUUID, result);
    await jsonCache.del(oldUUID);
};

module.exports = { updateUserState: updateUserState, getUserState: getUserState, updateUUID: updateUUID };
