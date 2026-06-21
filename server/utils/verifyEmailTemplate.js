const verifyEmailTemplate = (name , url) => {
    return`
    <div style="font-family:Arial,sans-serif;padding:20px">

        <p>Dear ${name},</p>

        <p>Thank you for registering Winkit.</p>

        <p>
            <a href="${url}" style="color:#2563eb;text-decoration:underline;font-weight:500">
                Verify Email
            </a>
        </p>

        <p style="margin-top:20px;font-size:14px;color:gray">
            If you did not create this account, you can ignore this email.
        </p>

    </div>
    `
}

export default verifyEmailTemplate