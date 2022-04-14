const jwt = require('jsonwebtoken');
const db = require('../connection');

module.exports = async (req, res, next) => {
    try {
        const conn = await db;
        const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.body.email = decoded.email;
        req.body.studentId = decoded.id;
        
		next();
    } catch (error) {
        res.status(401).json({ message: "Auth failed!" });
    }
}