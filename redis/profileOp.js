const Redis = require('ioredis');
const JSONCache = require('redis-json');

const redis = new Redis();
const jsonCache = new JSONCache(redis);

const updateUserState = async (uuid, data) => {
    await jsonCache.set(uuid, data);
};

const getUserState = async (uuid, extraFields) => {
    const result = await redis.get(uuid, ...extraFields);

    return result == null ? 0 : result;
};

const updateUUID = async (oldUUID, newUUID) => {
    let result = await jsonCache.get(oldUUID);

    if(result == null) return;

    await jsonCache.set(newUUID, result);
    await jsonCache.del(oldUUID);
}

module.exports = { updateUserState: updateUserState, getUserState: getUserState, updateUUID: updateUUID };
