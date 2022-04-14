const db = require('./connection');

const checkRedundantActivationCodes = async () => {
    try {
        const conn = await db;
        await conn.query(`DELETE FROM STUDENT WHERE status = 'NOT_ACTIVATED' AND created_at <= DATE_SUB(CURRENT_DATE(),INTERVAL 1 DAY);`);
        
    } catch (error) {
        console.log(error);
    }
    
}

const checkTimeOutedExamCodes = async () => {
    try {
        const conn = await db;
        await conn.query(`UPDATE CODE SET status = 'INVALID' WHERE status = 'VALID' AND created_at <= DATE_SUB(CURRENT_DATE(),INTERVAL 2 DAY);`);
        
    } catch (error) {
        console.log(error);
    }
    
}

module.exports = { checkRedundantActivationCodes, checkTimeOutedExamCodes };