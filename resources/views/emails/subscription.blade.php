<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff; border-radius:12px; padding:30px; text-align:center; box-shadow:0px 5px 15px rgba(0,0,0,0.1);">

                    <!-- Logo -->
                    <tr>
                        <td style="padding-bottom:20px;">
                            <img src="{{ asset('assets/images/Vector.png') }}" width="120" height="120"
                                style="border-radius:50%; object-fit:cover; display:block; margin:auto;" alt="Logo">
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td style="font-size:22px; font-weight:bold; color:#222222; padding-bottom:10px;">
                            One quick Step to get your transcript from
                        </td>
                    </tr>

                    <!-- Link -->
                    <tr>
                        <td style="font-size:18px; font-weight:bold; padding-bottom:20px;">
                            <a href="https://www.dev.buildors.com" style="color:#007bff; text-decoration:underline;">
                                www.buildors.com
                            </a>
                        </td>
                    </tr>

                    <!-- Paragraph -->
                    <tr>
                        <td style="font-size:16px; color:#555555; line-height:24px; padding-bottom:25px;">
                            To get transcript to you, we just need to confirm your email address. Please click the
                            button below to verify email:
                        </td>
                    </tr>

                    <!-- Button -->
                    <tr>
                        <td style="padding-bottom:30px;">
                            <a href="#"
                                style="background-color:#007bff; color:white; text-decoration:none; padding:12px 30px; border-radius:8px; font-size:16px; font-weight:bold; display:inline-block;">
                                Verify my email
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="font-size:14px; color:#777777; font-weight:bold;">
                            POWERED BY
                            <img src="{{ asset('assets/images/Vector.png') }}" width="18" height="18"
                                style="vertical-align:middle; margin-left:5px;" alt="icon">
                            BUILDORS
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
