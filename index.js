const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // For legacy browser support
}

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors(corsOptions));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'nationwideprintingandsignage.co.za',
    port: 465,
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
    auth: {
        user: 'info@nationwideprintingandsignage.co.za',
        pass: '?Jt8a^oc7&7-',
    },
});

// Verify Config
transporter.verify((err, success) => {
    if (err) console.error(err);
    console.log('Your config is correct');
});

const ordersEmail = 'matekatukiso@gmail.com'; // the receiver email: orders@nationwideprintingandsignage.co.za

app.post('/send-mail', (req, res) => {
    console.log(req.body)
    const { subject, data } = req.body;

    const mailData = {
        from: 'info@nationwideprintingandsignage.co.za',  // sender address
        to: ordersEmail,   // list of receivers
        subject: subject,
        html: `
            <div>
                <p>Hi, you have a neworder</p>
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
            return console.log(err)
        }
        res.status(200).send({ message: "Request Sent", message_id: info.messageId })
    });
});
