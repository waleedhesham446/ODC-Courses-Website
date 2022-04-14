const router = require('express').Router();
const { body, query, param } = require('express-validator');
const { 
    getAllStudents,
    getStudent,
    addAdmin,
    addExam,
    addCourse,
    addCategory,
    sendCode,
    getExams,
    getExamById,
    sendStatusMessage,
    deleteCourse,
    addTrainer,
    getAllEnroll,
    getQuestionsOfExam
} = require('../controllers/adminJobs');
const auth = require('../middlewares/auth');

router.get(
    '/students',
    auth,
    getAllStudents
);

router.get(
    '/student/:id',
    auth,
    param('id').notEmpty().isInt(),
    getStudent
);

router.post(
    '/addadmin',
    auth,
    body('username').notEmpty(),
    body('password').notEmpty(),
    body('role').notEmpty().contains('ADMINE'),
    addAdmin
);

router.post(
    '/addexam',
    auth,
    body('courseId').notEmpty().isInt(),
    param('questions').notEmpty(),
    addExam
);

router.post(
    '/addcourse',
    auth,
    body('name').notEmpty(),
    body('level').notEmpty().isInt(),
    body('categoryId').notEmpty().isInt(),
    addCourse
);

router.post(
    '/addcategory',
    auth,
    body('name').notEmpty(),
    addCategory
);

router.post(
    '/sendcode',
    auth,
    body('studentId').notEmpty().isInt(),
    body('examId').notEmpty().isInt(),
    sendCode
);

router.get(
    '/examsrecords',
    auth,
    getExams
);

router.get(
    '/examrecord/:examId',
    auth,
    param('examId').notEmpty().isInt(),
    getExamById
);

router.put(
    '/sendstatusmsg',
    auth,
    body('studentId').notEmpty().isInt(),
    body('enrollId').notEmpty().isInt(),
    body('courseId').notEmpty().isInt(),
    body('status').notEmpty(),
    sendStatusMessage
);

router.delete(
    '/course/:courseId',
    auth,
    param('courseId').notEmpty().isInt(),
    deleteCourse
);

router.post(
    '/addtrainer',
    auth,
    body('courseId').notEmpty().isInt(),
    body('name').notEmpty(),
    addTrainer
);

router.get(
    '/getenrolls',
    auth,
    getAllEnroll
);

router.get(
    '/getquestionsofexam/:examId',
    auth,
    param('examId').notEmpty().isInt(),
    getQuestionsOfExam
);

module.exports = router;