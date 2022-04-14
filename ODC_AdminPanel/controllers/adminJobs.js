const db = require('../connection');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const getAllStudents = async (req, res) => {
    const { type } = req.body;
    const { studentType } = req.query;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        let queryStr = `SELECT id, name, status, email, phone, address, college, created_at FROM STUDENT;`;
        if(studentType) queryStr = `SELECT id, name, status, email, phone, address, college, created_at FROM STUDENT WHERE status = '${studentType}';`;
        
        const data = await conn.query(queryStr);
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const getStudent = async (req, res) => {
    const { type } = req.body;
    const { id } = req.params;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const queryStr = `SELECT id, name, status, email, phone, address, college, created_at FROM STUDENT WHERE id = ${id};`;
        
        const data = await conn.query(queryStr);
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const addAdmin = async (req, res) => {
    const { username, password, role, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        if(password.length < 10) return res.status(400).json({ msg: 'Password must be at least 10 characters' });
        if(!username) return res.status(400).json({ msg: 'Username is required' });
        if(!role) return res.status(400).json({ msg: 'Admin role is required' });

        const conn = await db;
        const queryStr = `INSERT INTO ${role} VALUES(?, ?);`;
        const hashedPassword = await bcrypt.hash(password, 12);

        const data = await conn.query(queryStr, [ username, hashedPassword ]);
        return res.status(200).json({ msg: "New admin has been added successfully" });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const addExam = async (req, res) => {
    const { courseId, questions, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        for(let i = 0; i < questions.length; i++){
            const { content, answer } = questions[i];
            if(!content || !answer) return res.status(403).json({ msg: "Invalid QUESTIONS" });
        }
        
        const conn = await db;
        const createExamQuery = `INSERT INTO EXAM(course_id) VALUES(?);`;

        const exam = await conn.query(createExamQuery, [ courseId ]);
        const examId = exam.insertId;

        const createQuestionQuery = `INSERT INTO QUESTION(content, answer, exam_id) VALUES(?, ?, ?);`;
        for(let i = 0; i < questions.length; i++){
            const { content, answer } = questions[i];
            await conn.query(createQuestionQuery, [ content, answer, examId ]);
        }
        return res.status(200).json({ msg: "New exam has been added successfully" });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const addCourse = async (req, res) => {
    const { name, level, categoryId, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const queryStr = `INSERT INTO COURSE (name, level, category_id) VALUES (?, ?, ?);`;
        const data = await conn.query(queryStr, [ name, level, categoryId ]);

        return res.status(200).json({ msg: "New course has been added successfully" });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const addCategory  = async (req, res) => {
    const { name, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const queryStr = `INSERT INTO CATEGORY (name) VALUES (?);`;
        const data = await conn.query(queryStr, [ name ]);

        return res.status(200).json({ name, msg: "New category has been added successfully" });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const sendCode = async (req, res) => {
    const { studentId, examId, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const code = uuidv4();
        
        const conn = await db;
        const queryStr = `INSERT INTO CODE (code, status, student_id, exam_id) VALUES (?, ?, ?, ?);`;
        const data = await conn.query(queryStr, [ code, 'VALID', studentId, examId ]);

        return res.status(200).json({ msg: "Code has been sent successfully" });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const getExams = async (req, res) => {
    const { filterId, filterType } = req.query;
    const { type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        let queryStr = `SELECT * FROM REVISION WHERE ${filterType} = ?;`;
        if(!filterType) queryStr = `SELECT * FROM REVISION;`;
        const data = await conn.query(queryStr, [ filterId ]);
        
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const getExamById = async (req, res) => {
    const { examId } = req.params;
    const { type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const queryStr = `SELECT * FROM REVISION WHERE id = ?;`;
        const data = await conn.query(queryStr, [ examId ]);
        
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error });
    }
}

const sendStatusMessage = async (req, res) => {
    const { studentId, status, type, courseId, enrollId } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const [ course ] = await conn.query(`SELECT name FROM COURSE WHERE id = ?`, [ courseId ]);
        const queryStr = `UPDATE STUDENT SET status = ? WHERE id = ?;`;
        let statusMsg, enrollStatus;
        if(status === 'FREE'){
            statusMsg = `You Are Rejected from ${course.name}`;
            enrollStatus = 'EXPIRED';
        }else if(status === 'ENROLLED'){
            statusMsg = `You Are Accepted in ${course.name}`;
            enrollStatus = 'BINDING';
        }else{
            return res.status(201).json({ msg: "Invalid Status" });
        }
        await conn.query(queryStr, [ status, studentId ]);
        await conn.query(`INSERT INTO STATUS_MSG (msg, student_id) VALUES (?, ?)`, [ statusMsg, studentId ]);
        await conn.query(`UPDATE ENROLL SET status = '${enrollStatus}' WHERE id = ${enrollId};`);
        
        return res.status(200).json({ msg: 'Status Msg has been sent successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const deleteCourse = async (req, res) => {
    const { type } = req.body;
    const { courseId } = req.params;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        await conn.query(`DELETE FROM COURSE WHERE id = ?;`, [ courseId ]);
        
        return res.status(200).json({ msg: `Course with id ${courseId} has been deleted successfully` });

    } catch (error) {
        res.status(500).json({ error });
    }
}

const addTrainer  = async (req, res) => {
    const { name, courseId, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const queryStr = `INSERT INTO TRAINER (name) VALUES (?);`;
        const trainer = await conn.query(queryStr, [ name ]);

        await conn.query(`INSERT INTO TEACHING (trainer_id, course_id) VALUES (?, ?);`, [ trainer.insertId, courseId ]);

        return res.status(200).json({ msg: "New Instructor has been added successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const getAllEnroll  = async (req, res) => {
    const { type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const enrolls = await conn.query(`SELECT * FROM ENROLL;`);

        return res.status(200).json(enrolls);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const getQuestionsOfExam = async (req, res) => {
    const { examId } = req.params;
    const { type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if(type !== 'ADMINE' && type !== 'SUB_ADMINE') return res.status(401).json({ msg: "You are not admine" });
        
        const conn = await db;
        const queryStr = `SELECT * FROM QUESTION WHERE exam_id = ?;`;
        const data = await conn.query(queryStr, [ examId ]);
        
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = {
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
};