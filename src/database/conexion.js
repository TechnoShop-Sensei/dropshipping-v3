const { createPool } = require('mysql2/promise')

    const pool = createPool({ 
        host: 'phtfaw4p6a970uc0.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        port: 3306,
        user: 'paao5v36dza7gjiv',
        password: "hs06y520pzt8ckv0",
        database: "d9kpoa2eqordkf5b"
    });
    
    // const main = async() => {
    //     const select = ('SELECT 1 + 1')
    //     const [row] = await pool.query(select)
    //     console.log(row[0]);
    //     pool.end()
    // }

    // main()

    module.exports = pool

