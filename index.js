const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const cors = require('cors');

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const allowlist = ['http://localhost:4200', 'https://www.nationwideprintingandsignage.co.za'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'mail.nationwideprintingandsignage.co.za',
    port: 465,
    secure: true,
    auth: {
        user: 'sender@nationwideprintingandsignage.co.za',
        pass: '%[nj+t!!UU*$',
    },
});

// Verify Config
transporter.verify((err, success) => {
    if (err) return console.error(1, err);
    console.log('Your config is correct');
});

const ordersEmail = 'orders@nationwideprintingandsignage.co.za, sender@nationwideprintingandsignage.co.za'; // the receiver email: 

app.post('/send-mail', (req, res) => {
    console.log(req.body)
    const { subject, data } = req.body;

    const mailData = {
        from: 'sender@nationwideprintingandsignage.co.za',  // sender address
        to: ordersEmail,   // list of receivers
        subject: subject,
        html: `
            <div>
                <p>Hi, you have a new order</p>
                <div>
                    <p>Customer Full Name: <b>${data.firstName} ${data.lastName}</b></p>
                    <p>Customer Phone Number: <b>${data.phoneNumber}</b></p>
                    <p>Customer Email: <b>${data.email}</b></p>
                </div>
            
                <i>Product Information</i>
                <div>
                    <p>Product Code: <b>${data.productCode}</b></p>
                    <p>Product Id: <b>${data.productId}</b></p>
                    <p>Product Name: <b>${data.productName}</b></p>
                    <p>Product Color: <b>${data.color}</b></p>
                    <p>Product Size: <b>${data.size}</b></p>
                    <p>Product Price: <b>${data.productPrice}</b></p>
                    <p>Product Price includ. VAT: <b>${data.productPriceWithVat}</b></p>
                    <br>
                    <p>Customer Message: <i>${data.message}</i></p>
                </div>
            </div>
        `,
    };

    transporter.sendMail(mailData, (err, info) => {
        if (err) {
            return console.log(2, err)
        }
        res.status(200).send({ message: "Request Sent", message_id: info.messageId })
    });
});
