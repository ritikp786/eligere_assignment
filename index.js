import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const port = process.env.PORT ?? 8080;
const host = process.env.host ?? "127.0.0.1";

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
}

const app = express();

let connection;

try {
    // create the connection to database
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to DB");
} catch (err) {
    console.log(err);
}

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: false });

// Use body parser as json by default
app.use(jsonParser);

// set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Register API
// response stricture
// {
//     "success": true,
//     "message": "Registration successful. RegistrationId : asasjdjsad-sadasdasd1213-sadasdsa"
// }
app.post("/register", formParser, async (req, res, next) => {
    console.log("Received Registration request as : ", req.body);

    const data = req.body;

    const registrationId = uuidv4();

    try {
        const result = await connection.execute(
            `INSERT INTO \`registrations\` (registration_no, full_name, email, phone, events) values (?, ?, ?, ?, ?)`,
            [registrationId, data.fullName, data.email, data.phone, data.events]
        );

        // console.log(result);

        let responseData;

        if (result.length > 0 && result[0].affectedRows > 0) {
            responseData = { success: true, message: `Registration Successful. Registration Id = ${registrationId}` };
            sendMail(data, responseData);
        }
        else {
            responseData = { success: false, message: "Couldn't register. Something went wrong." };
        }

        res.render('result', responseData);
    } catch (err) {
        console.error(err);
        res.render('result', { success: false, message: "Couldn't register. Something went wrong." });
    }
});


app.post("/register", async (req, res, next) => {
    console.log("Received Registration request as : ", req.body);

    const data = req.body;

    const registrationId = uuidv4();

    try {
        const result = await connection.execute(
            `INSERT INTO \`registrations\` (registration_no, full_name, email, phone, events) values (?, ?, ?, ?, ?)`,
            [registrationId, data.fullName, data.email, data.phone, data.events]
        );

        // console.log(result);

        if (result.length > 0 && result[0].affectedRows > 0) {
            res.json({ success: true, message: `Registration Successful. Registration Id = ${registrationId}` });
        }
        else {
            res.json({ success: false, message: "Something went wrong." })
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Something went wrong." })
    }
});

// Listen for server
app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});


async function sendMail(data, result) {
    let transport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const message = {
        sender: process.env.MAIL_USERNAME,
        from: process.env.MAIL_USERNAME,
        replyTo: process.env.MAIL_USERNAME,
        to: data.email,
        subject: 'Registration Confirmation', // Subject line
        text: result.message // Plain text body
    };

    console.log("Trying to send mail");

    transport.sendMail(message, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
        }
    });
}

