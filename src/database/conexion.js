const { createPool } = require('mysql2/promise')

    const pool = createPool({ 
        host: 'monorail.proxy.rlwy.net',
        port: 38926,
        user: 'root',
        password: "WgFeuvJMcgBkvjpUkVSSYtanwKsAAmlh",
        database: "railway"
    });
    
    // const main = async() => {
    //     const select = ('SELECT 1 + 1')
    //     const [row] = await pool.query(select)
    //     console.log(row[0]);
    //     pool.end()
    // }

    // main()

    module.exports = pool

