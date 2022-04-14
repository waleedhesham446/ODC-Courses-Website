const jwt = require('jsonwebtoken');
const db = require('../connection');

module.exports = async (req, res, next) => {
    try {
        const conn = await db;
        const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        const username = decoded.username;
        const password = decoded.password;
        const type = decoded.type;
        const [ admin ] = await conn.query(`SELECT * FROM ${type} WHERE username = ?;`, [ username ]);
        if(!admin) return res.status(403).json({ msg: "You are not admin, wrong username" });
        // const isAdmine = await bcrypt.compare(password, admin.password);
        // const isAdmine = (password == admin.password);
        // if(!isAdmine) return res.status(401).json({ msg: "You are not admin, wrong password" });
        req.body.type = type;
		next();
    } catch (error) {
        res.status(401).json({ message: "Auth failed!" });
    }
}