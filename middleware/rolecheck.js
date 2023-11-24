const { users } = require('../models');
const { Op } = require('sequelize');
const { getUserState, updateUserState } = require('../redis/profileOp');

const authorizedAsAdmin = (req, res, next) => {
    if (req.userinfo.role === 'admin') {
        next();
    }
    else {
        res.status(403).send({ error: true, res: "forbidden" });
    }
};

const authorizedAsModerator = (req, res, next) => {
    if (req.userinfo.role === 'moderator') {
        next();
    }
    else {
        res.status(403).send({ error: true, res: "forbidden" });
    }
};

roleCheck = async (uuid, role) => {
    try {
        let result = await getUserState(uuid, 'role');

        if (result == undefined) {
            result = await users.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: uuid,
                    },
                },
            });

            if (result == null) {
                return "Invalid Resource";
            }

            await updateUserState(uuid, result);
        }
    }
    catch (err) {
        return err.message;
    }

    if (result.role !== role) {
        return "forbidden";
    }
};

module.exports = { authorizedAsAdmin: authorizedAsAdmin, authorizedAsModerator: authorizedAsModerator, roleCheck: roleCheck };
