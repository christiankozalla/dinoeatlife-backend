import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

import { Profile, User, Token } from "@prisma/client";

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

async function sendVerifyMail({
  userName,
  userEmail,
  emailToken
}: {
  userName: Profile["name"];
  userEmail: User["email"];
  emailToken: Token["token"];
}) {
  let emailTemplate = fs.readFileSync(path.resolve(__dirname, "../../email/validate-email.html"), {
    encoding: "utf-8"
  });

  // Url Param: emailToken - Holds the base64 encoded emailToken
  // Url Param: user - Holds the base64 encoded userEmail

  const encodedEmail = Buffer.from(userEmail).toString("base64url");
  const encodedToken = Buffer.from(emailToken).toString("base64url");

  let stringifiedHtml = emailTemplate
    .replaceAll("[[USERNAME]]", userName || "Puroviva User")
    .replaceAll("[[USEREMAIL]]", encodedEmail)
    .replaceAll("[[EMAILTOKEN]]", encodedToken);

  const message = {
    from: "christian@puroviva.de",
    to: userEmail,
    subject: "Puroviva - Verify your Email",
    html: stringifiedHtml
  };

  try {
    const sent = await transporter.sendMail(message);

    return sent;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export default { sendVerifyMail };