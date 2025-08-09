export const forgotPasswordTemplate = ({
  user,
  otp,
  appName,
  otpExpireMinutes,
}: {
  user: { fullName?: string };
  otp: string;
  appName: string;
  otpExpireMinutes: number;
}) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Reset Mật khẩu</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #ffffff;
      padding: 32px;
      color: #0f172a;
    }
    .container {
      max-width: 520px;
      margin: auto;
      border-radius: 12px;
      border: 1px solid #22d3ee;
      background-color: #0f172a;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      padding: 32px;
    }
    .title {
      font-size: 22px;
      color: #facc15;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .greeting, .message, .note {
      color: #e2e8f0;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .otp-box {
      display: inline-block;
      background-color: #0ea5e9;
      padding: 16px 32px;
      font-size: 26px;
      color: white;
      letter-spacing: 8px;
      border-radius: 10px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      font-size: 14px;
      color: #94a3b8;
    }
    .app-name {
      font-weight: 600;
      color: #22c55e;
    }
    hr {
      border: none;
      border-top: 1px solid #334155;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Yêu cầu đặt lại mật khẩu</div>
    <p class="greeting">Xin chào <strong>${user.fullName || "bạn"}</strong>,</p>
    <p class="message">
      Bạn vừa yêu cầu đặt lại mật khẩu. Hãy sử dụng mã OTP dưới đây để tiếp tục quá trình:
    </p>
    <div class="otp-box">${otp}</div>
    <p class="note">
      Mã OTP có hiệu lực trong vòng <strong>${otpExpireMinutes} phút</strong>. Vui lòng không chia sẻ với người khác để đảm bảo an toàn tài khoản.
    </p>
    <p class="message">
      Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.
    </p>
    <hr/>
    <p class="footer">
      Cảm ơn bạn đã sử dụng <span class="app-name">${appName}</span>.<br/>
      Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng nếu bạn cần trợ giúp thêm.
    </p>
  </div>
</body>
</html>
`;

export interface OrderSuccessTemplateProps {
  customerName: string;
  orderId: string | number;
  orderDate: string;
  paymentMethod: string;
  itemsHtml: string; // HTML table rows for products
  totalPrice: string;
  shipAddress: string;
  shipPhone: string;
  appName?: string;
  orderLink?: string;
  year?: number;
}

export const orderSuccessTemplate = ({
  customerName,
  orderId,
  orderDate,
  paymentMethod,
  itemsHtml,
  totalPrice,
  shipAddress,
  shipPhone,
  appName = "LaptopShop",
  orderLink = "https://example.com",
  year = new Date().getFullYear(),
}: OrderSuccessTemplateProps) => `
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Đặt hàng thành công</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0f172a;">
    <div style="max-width: 600px; margin: auto; background-color: #1e293b; padding: 32px; border-radius: 10px; color: #f8fafc;">
      <h2 style="color: #facc15; font-size: 24px; margin-bottom: 16px;">
        🎉 Đặt hàng thành công!
      </h2>
      <p style="font-size: 16px; color: #e2e8f0;">
        Xin chào <strong>${customerName}</strong>, cảm ơn bạn đã mua hàng tại <span style="color: #38bdf8;">${appName}</span>!
        <br />
        Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành xử lý.
      </p>

      <hr style="border-color: #334155; margin: 24px 0;" />

      <h3 style="font-size: 18px; color: #facc15; margin-bottom: 8px;">📋 Thông tin đơn hàng</h3>
      <ul style="list-style: none; padding: 0; font-size: 14px; color: #cbd5e1;">
        <li><strong>Mã đơn hàng:</strong> #${orderId}</li>
        <li><strong>Ngày đặt:</strong> ${orderDate}</li>
        <li><strong>Thanh toán:</strong> ${paymentMethod}</li>
      </ul>

      <h3 style="font-size: 18px; color: #facc15; margin-top: 24px;">🛒 Sản phẩm</h3>
      <table style="width: 100%; font-size: 14px; color: #e2e8f0; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #1e3a8a; color: #facc15;">
            <th style="text-align: left; padding: 8px;">Sản phẩm</th>
            <th style="text-align: center; padding: 8px;">SL</th>
            <th style="text-align: right; padding: 8px;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 16px; margin-top: 16px; color: #facc15;">
        <strong>Tổng cộng:</strong> ${totalPrice}
      </div>

      <h3 style="font-size: 18px; color: #facc15; margin-top: 32px;">🚚 Địa chỉ giao hàng</h3>
      <p style="font-size: 14px; color: #cbd5e1;">
        ${shipAddress} <br />
        SĐT: ${shipPhone}
      </p>

      <div style="margin-top: 32px; text-align: center;">
        <a href="${orderLink}" style="background-color: #facc15; color: #0f172a; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
          Xem đơn hàng
        </a>
      </div>

      <hr style="margin: 40px 0; border-color: #334155;" />

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        © ${year} ${appName} – Mọi quyền được bảo lưu.
      </p>
    </div>
  </body>
</html>
`;
