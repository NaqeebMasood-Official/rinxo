import transporter from "../config/mail.js";

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `Rinxo Support <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed: ", err.message);
    throw new Error("Email could not be sent!");
  }
};

export default sendEmail;
