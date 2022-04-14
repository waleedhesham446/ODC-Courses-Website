const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const db = require('../connection');

const signup = async (req, res) => {
    const { name, email, password, phone, college, address } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        if(password.length < 10) return res.status(400).json({ msg: 'Password must be at least 10 characters' });
        const conn = await db;
        const hashedPassword = await bcrypt.hash(password, 12);
        const data = await conn.query(`INSERT INTO STUDENT (name, email, password, phone, college, address, status) VALUES (?, ?, ?, ?, ?, ?, ?);`, [ name, email, hashedPassword, phone, college, address, 'NOT_ACTIVATED' ]);

        const activationCode = uuidv4();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Activate Your Account",
            html: `<div><a href='http://localhost:3000/auth/activate?activationCode=${activationCode}'>Activate Account</a></div>`,
        };
        let info = await transporter.sendMail(mailOptions);
    
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        await conn.query(`INSERT INTO ACTIVATION VALUES('${activationCode}', '${email}')`);
        return res.status(200).json({ msg: 'You have signed up successfully, check your email' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        const [ student ] = await conn.query(`SELECT * FROM STUDENT WHERE email = ?;`, [ email ]);
        if(!student) return res.status(403).json({ msg: "You are not registered" });
        const isActivated = (student.status !== 'NOT_ACTIVATED');
        const isPassword = await bcrypt.compare(password, student.password);
        if(!isActivated || !isPassword) return res.status(401).json({ msg: "You are not authorized to login" });
        
        const token = await jwt.sign({ email, password, id: student.id }, process.env.JWT_PRIVATE_KEY);
        delete student.password;
        return res.status(200).json({ token, student, msg: 'You have signed in successfully' });

    } catch (error) {
        res.status(500).json({ error });
    }
}


const activateAccount = async (req, res) => {
    const { activationCode } = req.query;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        
        const conn = await db;
        const [ data ] = await conn.query(`SELECT * FROM ACTIVATION WHERE code = ?;`, [ activationCode ]);
        
        if(!data) return res.send('Invalid Activation Code');

        const activateStudentQuery = `UPDATE STUDENT SET status = 'ACTIVATED' WHERE email = ? AND status = 'NOT_ACTIVATED';`;
        await conn.query(activateStudentQuery, [ data.student_email ]);

        return res.send('Your account has been activated successfully, go sign in');
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = { signup, signin, activateAccount };