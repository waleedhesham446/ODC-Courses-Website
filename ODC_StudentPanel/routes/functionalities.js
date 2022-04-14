const router = require('express').Router();
const { body, query, param } = require('express-validator');
const { getCourses, getCourseById, applyForCourse, takeExam, submitExam, getStatusMsgs, getExamCodes } = require('../controllers/functionalities');
const auth = require('../middlewares/auth');

router.get(
    '/courses',
    auth,
    getCourses
);

router.get(
    '/courses/:courseId',
    auth,
    param('courseId').notEmpty().isInt(),
    getCourseById
);

router.post(
    '/apply/:courseId',
    auth,
    param('courseId').notEmpty().isInt(),
    body('studentId').notEmpty().isInt(),
    applyForCourse
);

router.get(
    '/takeexam',
    auth,
    query('examCode').notEmpty().isUUID(),
    body('studentId').notEmpty().isInt(),
    takeExam
);

router.post(
    '/submitexam',
    auth,
    body('examCode').notEmpty().isUUID(),
    body('studentId').notEmpty().isInt(),
    body('answers').notEmpty().contains('[').contains(']').contains(',').contains('"'),
    submitExam
);

router.get(
    '/statusmsgs',
    auth,
    body('studentId').notEmpty().isInt(),
    getStatusMsgs
);

router.get(
    '/examcodes',
    auth,
    body('studentId').notEmpty().isInt(),
    getExamCodes
);

module.exports = router;