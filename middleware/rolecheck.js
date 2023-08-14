const { users } = require('../models');
const { Op } = require('sequelize');

const authorizedAsAdmin = (req, res, next) => {
    if (req.userinfo.role === 'admin') {
        next();
    }
    else {
        res.status(403).send("forbidden");
    }
}

const authorizedAsModerator = (req, res, next) => {
    if (req.userinfo.role === 'moderator') {
        next();
    }
    else {
        res.status(403).send("forbidden");
    }
}

roleCheck = async (uuid, role) => {
    try {
        result = await users.findOne({
            where: {
                "uuid": {
                    [Op.eq]: uuid,
                },
            },
            attributes: ['role'],
        })
    }
    catch (err) {
        return err.message;
    }

    if (result.role !== role) {
        return "forbidden";
    }
}

module.exports = { authorizedAsAdmin: authorizedAsAdmin, authorizedAsModerator: authorizedAsModerator, roleCheck: roleCheck };
