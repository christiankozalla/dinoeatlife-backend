import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
  host: "smtp.ionos.de",
  port: 587,
  secure: false,
  auth: {
    user: "christian@puroviva.de",
    pass: process.env.SMTP_CREDENTIALS
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Connected to SMTP - ready to send mail");
  }
});

export default transporter;

async function send() {
  let emailTemplate = fs.readFileSync(process.cwd()+"/email/verify-mail.html", { encoding: "utf-8" });
  let username = "Michael";
  let userEmail = "michael.kozalla@yahoo.de"
  let stringifiedHtml = emailTemplate.replace("[[USERNAME]]", username);

  const message = {
    from: "christian@puroviva.de",
    to: userEmail,
    subject: "Puroviva - Verify your Email",
    html: stringifiedHtml
  };

  const sent = await transporter.sendMail(message);

  console.log(sent);
}

send();
