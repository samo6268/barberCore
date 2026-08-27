import { OtpPurpose } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService OTP delivery', () => {
  const otpService = {
    createOtp: jest.fn(),
    invalidateOtp: jest.fn(),
  };
  const smsService = { sendOtp: jest.fn() };

  const service = new AuthService(
    {} as any,
    {} as any,
    {} as any,
    otpService as any,
    smsService as any,
  );

  beforeEach(() => jest.clearAllMocks());

  it('delivers the generated code through SmsService', async () => {
    otpService.createOtp.mockResolvedValue('654321');
    smsService.sendOtp.mockResolvedValue(undefined);

    await expect(service.sendOtp('09121234567', OtpPurpose.LOGIN)).resolves.toEqual({
      message: 'کد تأیید ارسال شد',
    });
    expect(smsService.sendOtp).toHaveBeenCalledWith('09121234567', '654321');
    expect(otpService.invalidateOtp).not.toHaveBeenCalled();
  });

  it('invalidates a code that was not delivered', async () => {
    const deliveryError = new Error('delivery failed');
    otpService.createOtp.mockResolvedValue('654321');
    smsService.sendOtp.mockRejectedValue(deliveryError);
    otpService.invalidateOtp.mockResolvedValue(undefined);

    await expect(service.sendOtp('09121234567', OtpPurpose.LOGIN)).rejects.toBe(deliveryError);
    expect(otpService.invalidateOtp).toHaveBeenCalledWith('09121234567', OtpPurpose.LOGIN);
  });
});
