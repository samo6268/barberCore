import { ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { SmsService } from './sms.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createService(values: Record<string, string>) {
  const config = {
    get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
  };

  return new SmsService(config as any);
}

describe('SmsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not consume SMS credit in console development mode', async () => {
    const service = createService({ NODE_ENV: 'development', SMS_PROVIDER: 'console' });

    await service.sendOtp('09121234567', '123456');

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('sends OTP through Kavenegar VerifyLookup with the approved template', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { return: { status: 200, message: 'تایید شد' }, entries: [] },
    });
    const service = createService({
      NODE_ENV: 'production',
      SMS_PROVIDER: 'kavenegar',
      KAVENEGAR_API_KEY: 'secret-api-key',
      KAVENEGAR_OTP_TEMPLATE: 'parnegarinlogin',
    });

    await service.sendOtp('09121234567', '654321');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.kavenegar.com/v1/secret-api-key/verify/lookup.json',
      'receptor=09121234567&token=654321&template=parnegarinlogin&type=sms',
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('fails closed when production SMS credentials are missing', async () => {
    const service = createService({ NODE_ENV: 'production', SMS_PROVIDER: 'kavenegar' });

    await expect(service.sendOtp('09121234567', '654321')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('returns a safe service error when Kavenegar rejects the request', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('request contains secret URL'));
    const service = createService({
      NODE_ENV: 'production',
      SMS_PROVIDER: 'kavenegar',
      KAVENEGAR_API_KEY: 'secret-api-key',
      KAVENEGAR_OTP_TEMPLATE: 'parnegarinlogin',
    });

    await expect(service.sendOtp('09121234567', '654321')).rejects.toMatchObject({
      message: 'ارسال کد تأیید موقتاً امکان‌پذیر نیست؛ لطفاً دوباره تلاش کنید',
    });
  });
});
