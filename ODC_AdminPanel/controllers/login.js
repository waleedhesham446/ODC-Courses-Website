const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const db = require('../connection');

const adminLogin = async (req, res) => {
    const { username, password, type } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const conn = await db;
        const [ admin ] = await conn.query(`SELECT * FROM ${type} WHERE username = ?;`, [ username ]);
        if(!admin) return res.status(403).json({ msg: "You are not admin, wrong username" });
        const isAdmine = await bcrypt.compare(password, admin.password);
        // const isAdmine = (password == admin.password);
        if(!isAdmine) return res.status(401).json({ msg: "You are not admin, wrong password" });
        
        const token = await jwt.sign({ username, password, type }, process.env.JWT_PRIVATE_KEY);
        return res.status(200).json({ token, username, type, msg: 'You have signed in successfully' });

    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = { adminLogin };