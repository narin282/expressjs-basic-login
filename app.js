const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')
const secret = 'fullstacklogin'

const database = require('./database')

app.use(cors())

app.post('/register', jsonParser, async (req, res, next) => {
    const {email, password, fname, lname} = req.body
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    let sql = `INSERT INTO users (email, password, fname, lname) VALUES(?, ?, ?, ?)`

    let result

    try {
        result = await database.query(sql,[email, hash, fname, lname])
    } catch (error) {
        res.json({status: 'error', message: error})
        return
    }

    if (result.affectedRows) {
        res.json({status: 'ok'})
    }
})

app.post('/login', jsonParser, async (req, res, next) => {
    const {email, password} = req.body
    
    let sql = `SELECT * FROM users WHERE email = ?`

    let result

    try {
        result = await database.query(sql,[email])
    } catch (error) {
        res.json({status: 'error', message: error})
        return
    }

    if (result.length > 0) {
        const isLogin = bcrypt.compareSync(password, result[0].password)

        if (isLogin) {
            const token = jwt.sign({ email: result[0].email }, secret, { expiresIn: '1h' })
            res.json({
                status: 'ok', 
                message: 'Login success', 
                token: token
            })
        } else {
            res.json({
                status: 'error', 
                message: 'Invalid password'
            })
        }

    } else {
        res.json({
            status: 'error', 
            message: 'No user found'
        })
    }
})

app.post('/auth', jsonParser,  (req, res, next) => {
    try {
        const auth = req.headers.authorization
        const token = auth.split(' ')[1]
        const decoded = jwt.verify(token, secret)

        res.json({status: 'ok', decoded})
    } catch (err) {
        res.json({status: 'error', mesasge: err})
    }
})

app.listen(3333, () => {
    console.log('CORS-enabled web server listening on port 3333')
})