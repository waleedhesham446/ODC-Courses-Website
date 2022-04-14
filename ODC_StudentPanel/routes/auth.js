const router = require('express').Router();
const { body, query } = require('express-validator');
const { signup, signin, activateAccount } = require('../controllers/auth');

router.post(
    '/signup',
    body('email').isEmail().normalizeEmail().notEmpty(),
    body('password').notEmpty(),
    body('name').notEmpty(),
    body('phone').notEmpty(),
    signup
);

router.post(
    '/signin',
    body('email').isEmail().normalizeEmail().notEmpty(),
    body('password').notEmpty(),
    signin
);

router.get(
    '/activate',
    query('activationCode').isUUID().notEmpty(),
    activateAccount
);

module.exports = router;