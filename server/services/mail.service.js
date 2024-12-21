const nodemailer = require('nodemailer');

require('dotenv').config();

const { EMAIL_ADDRESS, EMAIL_TOKEN } = process.env;
const log = require('./log.service');

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_TOKEN
    }
});

module.exports = {
    sendEmail: async function(toEmail, subject, content){
        try {
            let emailText, emailHtml = buildEmailBody(content);
            
            if(!toEmail || !subject){
                log.warning("Missing toEmail or subject so email send was canceled");
                return { "email_status":false };
            }

            const mailDetails = {
                from: `Praying Hands Massage & Bodywork <${EMAIL_ADDRESS}>`, // sender address
                to: toEmail, 
                subject: subject,
                text: emailText,
                html: emailHtml,
            }
            
            let info = await mailTransporter.sendMail(mailDetails);
            log.info(`Email Sent: ${info.messageId}`);
            return { email_status: true };
        }
        catch(ex){
            log.error(`Sending Email: ${ex}`);
            return { error: `Sending Email: ${ex}`, email_status: false };
        }
    },
    sendEmailAttachment: async function(toEmail, subject, content, files){
        try {
            let emailText, emailHtml = buildEmailBody(content);
            
            if(!toEmail || !subject){
                log.warning("Missing toEmail or subject so email send was canceled");
                return { "email_status":false };
            }

            let file_list = Array.isArray(files) ? files :  [files];

            let attachment_list = file_list.map((file) => {
                return { filename: file.name, content: file.data }; 
            });

            const mailDetails = {
                from: `St. Elizabeth HSA Website <${EMAIL_ADDRESS}>`, // sender address
                to: toEmail, 
                subject: subject,
                text: emailText,
                html: emailHtml,
                attachments: attachment_list
            }
            
            let info = await mailTransporter.sendMail(mailDetails);
            log.info(`Email Sent: ${info.messageId}`);
            return { email_status: true };
        }
        catch(ex){
            log.error(`Sending Email: ${ex}`);
            return { error: `Sending Email: ${ex}`, email_status: false };
        }
    }
}

/* Private Functions */
function buildEmailBody(content){
    let text = "", html ="";
    try {
        content.forEach((item) =>{
            text += ` ${item}`;
            html += `<p>${item}</p>`;
        });
    }
    catch(ex){
        log.error(`Building Email Body: ${ex}`);
    }

    return text, html;
}