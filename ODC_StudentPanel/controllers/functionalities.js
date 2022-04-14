const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../connection');

const getCourses = async (req, res) => {
    const { filterKey, filterValue } = req.query;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        
        const conn = await db;
        let queryStr = `SELECT COURSE.name, level, category_id, TRAINER.name AS trainer FROM COURSE LEFT JOIN TEACHING ON COURSE.id = TEACHING.course_id LEFT JOIN TRAINER ON TEACHING.trainer_id = TRAINER.id;`;
        if(filterKey == 'CATEGORY' && filterValue) queryStr = `SELECT COURSE.name, level FROM COURSE LEFT JOIN CATEGORY ON CATEGORY.id = category_id WHERE CATEGORY.id = ?;`;
        else if(filterKey == 'ENROLLED' && filterValue) queryStr = `SELECT COURSE.name, level, category_id FROM COURSE LEFT JOIN ENROLL ON COURSE.id = course_id WHERE student_id = ?;`;
        else if(filterKey == 'TEACHING' && filterValue) queryStr = `SELECT COURSE.name, level, category_id FROM COURSE LEFT JOIN TEACHING ON COURSE.id = course_id WHERE trainer_id = ?;`;
        
        const courses = await conn.query(queryStr, [ filterValue ]);

        return res.status(200).json({ courses });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const getCourseById = async (req, res) => {
    const { courseId } = req.params;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const conn = await db;
        const queryStr = `SELECT * FROM COURSE WHERE id = ?;`;
        
        const course = await conn.query(queryStr, [ courseId ]);

        return res.status(200).json(course);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const applyForCourse = async (req, res) => {
    const { courseId } = req.params;
    const { studentId } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        
        const [ previousEnrollments ] = await conn.query(`SELECT * FROM ENROLL WHERE student_id = ${studentId} AND status = 'BINDING';`);
        if(previousEnrollments) return res.status(401).json({ msg: "You are already enrolled in a course" });

        await conn.query(`INSERT INTO ENROLL (student_id, course_id, status) VALUES (${studentId}, ${courseId}, 'BINDING');`);
        await conn.query(`UPDATE STUDENT SET status = 'APPLIED' WHERE id = ${studentId};`);
        
        return res.status(200).json({ msg: "You have applied for this course successfully"});

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const takeExam = async (req, res) => {
    const { examCode } = req.query;
    const { studentId } = req.body;
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
      
        while (currentIndex != 0) {
      
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        
        const [ codeRecord ] = await conn.query(`SELECT * FROM CODE WHERE code = ? AND student_id = ? AND status = 'VALID';`, [ examCode, studentId]);
        if(!codeRecord) return res.status(403).json({ msg: 'Invalid Code' });

        const examQuestions = await conn.query(`SELECT content, answer AS A FROM QUESTION WHERE exam_id = ${codeRecord.exam_id};`);
        for(let i = 0; i < examQuestions.length; i++){
            examQuestions[i].choices = [examQuestions[i].A];
            examQuestions[i].choices.push('W1');
            examQuestions[i].choices.push('W2');
            examQuestions[i].choices.push('W3');
            delete examQuestions[i].A;
            examQuestions[i].choices = shuffle(examQuestions[i].choices);
        }
        return res.status(200).json(examQuestions);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const submitExam = async (req, res) => {
    let { examCode, studentId, answers } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        
        const conn = await db;
        
        const [ codeRecord ] = await conn.query(`SELECT * FROM CODE WHERE code = ? AND student_id = ? AND status = 'VALID';`, [ examCode, studentId]);
        if(!codeRecord) return res.status(403).json({ msg: 'Invalid Code' });
        answers = answers.substring(1).slice(0, -1).split(',');
        answers = answers.map((ans) => ans.trim().substring(1).slice(0, -1));

        const questionsAnswers = await conn.query(`SELECT answer FROM QUESTION WHERE exam_id = ?;`, [ codeRecord.exam_id ])

        let degree = 0, totalRight = 0, totalWrong = 0;
        for(let i = 0; i < answers.length; i++) {
            if(answers[i] == questionsAnswers[i].answer) {
                degree++;
                totalRight++;
            }else{
                totalWrong++;
            }
        }
        const percentage = 100.0*degree/(totalWrong + totalRight);

        await conn.query(`INSERT INTO REVISION (degree, total_right, total_wrong, student_id, exam_id, exam_code) VALUES (?, ?, ?, ?, ?, ?);`, [ percentage, totalRight, totalWrong, codeRecord.student_id, codeRecord.exam_id, examCode]);
        
        return res.status(200).json({ percentage, totalRight, totalWrong, msg: 'Your answer has been submitted successfully' });
        
    } catch (error) {
        res.status(500).json({ error });
    }
}

const getStatusMsgs = async (req, res) => {
    const { studentId } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        
        const statusMsgs = await conn.query(`SELECT msg FROM STATUS_MSG WHERE student_id = ?;`, [ studentId ]);
        
        return res.status(200).json(statusMsgs);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const getExamCodes = async (req, res) => {
    const { studentId } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        
        const statusMsgs = await conn.query(`SELECT code, name FROM CODE JOIN EXAM ON EXAM.id = CODE.exam_id JOIN COURSE ON COURSE.id = course_id WHERE student_id = ?;`, [ studentId]);
        
        return res.status(200).json(statusMsgs);

    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = { getCourses, getCourseById, applyForCourse, takeExam, submitExam, getStatusMsgs, getExamCodes };