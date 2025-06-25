import axios from 'axios';
import appConst from '../config/app.const';

interface SendOtpResponse {
  success: boolean;
  otp: number | null;
}

export const SendOtpUsingWhatsappTemplate = async (phone: string, otp: number | null = null): Promise<SendOtpResponse> => {
  if (!otp) {
    otp = Math.floor(1000 + Math.random() * 9000);
  }

  const url: string = appConst.whatsApp.whatsapp_template_url;
  const bearerToken: string = appConst.whatsApp.whatsapp_token;
  const templateName: string = appConst.template.template_name;
  const templateLanguage: string = appConst.template.template_language;

  const data = {
    token: bearerToken,
    phone: String(phone),
    template_name: templateName,
    template_language: templateLanguage,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: otp.toString(),
          },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: otp.toString(),
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(url, data);
    if (response.status === 200 && response.data.status === 'success') {
      return {
        success: true,
        otp,
      };
    }

    return {
      success: false,
      otp: null,
    };
  } catch (error: any) {
    console.error('sendOtpUsingWhatsappTemplate error:', error?.message);
    return {
      success: false,
      otp: null,
    };
  }
}
