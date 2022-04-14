const router = require('express').Router();
const { adminLogin } = require('../controllers/login');
const { body } = require('express-validator');

router.post('/admin', (req, res, next) => {
        req.body.type = 'ADMINE';
        next();
    },
    body('username').notEmpty(),
    body('password').notEmpty(),
    adminLogin
);

router.post('/subadmin', (req, res, next) => {
        req.body.type = 'SUB_ADMINE';
        next();
    },
    body('username').notEmpty(),
    body('password').notEmpty(),
    adminLogin
);

module.exports = router;