const CouponEmailTemplate = (username, coupon) => {
    const discountLine = coupon.type === 'flat'
        ? `<span style="font-size:42px;font-weight:900;color:#fff;">Rs. ${Number(coupon.value).toLocaleString()} OFF</span>`
        : `<span style="font-size:42px;font-weight:900;color:#fff;">${coupon.value}% OFF</span>`;

    const expiryLine = coupon.expiresAt
        ? `<p style="margin:0;font-size:13px;color:#888;">Expires on <strong>${new Date(coupon.expiresAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>`
        : `<p style="margin:0;font-size:13px;color:#888;">No expiry date — use it anytime</p>`;

    const minOrderLine = coupon.minOrderAmount
        ? `<p style="margin:4px 0 0;font-size:13px;color:#888;">Minimum order: <strong>Rs. ${Number(coupon.minOrderAmount).toLocaleString()}</strong></p>`
        : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your VibeFit Coupon</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:#FFA239;padding:24px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">VibeFit Exclusive Offer</p>
              <h1 style="margin:8px 0 0;font-size:28px;color:#fff;font-weight:800;">🎁 You've got a gift!</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0;font-size:16px;color:#333;">Hey <strong>${username}</strong>,</p>
              <p style="margin:10px 0 0;font-size:15px;color:#555;line-height:1.6;">We appreciate you being a valued VibeFit customer. Here's a special coupon just for you — enjoy your exclusive discount on your next order!</p>
            </td>
          </tr>

          <!-- Coupon card -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:linear-gradient(135deg,#FFA239 0%,#ff7a00 100%);border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.85);letter-spacing:1px;text-transform:uppercase;">Your Coupon Code</p>
                    ${discountLine}
                    <div style="margin:20px auto;display:inline-block;background:rgba(255,255,255,0.15);border:2px dashed rgba(255,255,255,0.6);border-radius:10px;padding:14px 32px;">
                      <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:6px;font-family:monospace;">${coupon.code}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-radius:10px;border:1px solid #ffe0b2;">
                <tr>
                  <td style="padding:16px 20px;">
                    ${expiryLine}
                    ${minOrderLine}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- How to use -->
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#333;">How to use:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;height:28px;background:#FFA239;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-weight:700;font-size:13px;">1</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#555;">Go to <strong>vibefit-kappa.vercel.app</strong> and add items to your cart</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;height:28px;background:#FFA239;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-weight:700;font-size:13px;">2</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#555;">Head to <strong>Checkout</strong> and look for "Your Coupons"</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;height:28px;background:#FFA239;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-weight:700;font-size:13px;">3</span>
                        </td>
                        <td style="padding-left:12px;font-size:14px;color:#555;">Click on your coupon card or enter code <strong>${coupon.code}</strong> and hit Apply</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="https://vibefit-kappa.vercel.app" style="display:inline-block;background:#FFA239;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:8px;">Shop Now →</a>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">This coupon is valid for one-time use only and is assigned exclusively to your account.<br/>Cannot be combined with other offers.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#bbb;">© 2026 VibeFit. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export default CouponEmailTemplate;
