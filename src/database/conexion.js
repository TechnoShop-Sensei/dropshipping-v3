const { createPool } = require('mysql2/promise')
require('dotenv').config();

    const pool = createPool({ 
        host: process.env.host,
        port: process.env.portbd,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });
    
    // const main = async() => {
    //     const select = ('SELECT 1 + 1')
    //     const [row] = await pool.query(select)
    //     console.log(row[0]);
    //     pool.end()
    // }

    // main()

    module.exports = pool

