const send = (data, tokens) => {
    if (global.firebaseMessaging == undefined) {
        return false;
    }

    global.firebaseMessaging.send({
        data: data,
        registration_ids: tokens,
    });
};

module.exports = { send: send };