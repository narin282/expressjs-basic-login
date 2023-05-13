const mysql = require('mysql')
const util = require('util')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb'
})
  
pool.getConnection((err, connection) => {
    if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error(color.red, `${timestamp()} :: Database connection was closed.`)
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error(color.red, `${timestamp()} :: Database has too many connections.`)
      }
      if (err.code === 'ECONNREFUSED') {
        console.error(color.red, `${timestamp()} :: Database connection was refused.`)
      }
    }
  
    if (connection) connection.release()
    
    return
})

pool.query = util.promisify(pool.query)

module.exports = pool