import { BadRequestException, HttpException } from '@nestjs/common';
import { OtpPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OtpService } from './otp.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('OtpService', () => {
  const prisma = {
    otpCode: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const config = { get: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockImplementation((key: string, fallback?: string) =>
      key === 'NODE_ENV' ? 'development' : fallback,
    );
  });

  it('stores a hash instead of the plain OTP code', async () => {
    prisma.otpCode.findFirst.mockResolvedValue(null);
    prisma.otpCode.updateMany.mockResolvedValue({ count: 0 });
    prisma.otpCode.create.mockResolvedValue({ id: 'otp-1' });
    mockedBcrypt.hash.mockResolvedValue('hashed-code' as never);
    const service = new OtpService(prisma as any, config as any);

    const code = await service.createOtp('09121234567', OtpPurpose.LOGIN);

    expect(code).toBe('123456');
    expect(prisma.otpCode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ code: 'hashed-code' }),
    });
    expect(prisma.otpCode.create).not.toHaveBeenCalledWith({
      data: expect.objectContaining({ code: '123456' }),
    });
  });

  it('rate limits repeated OTP requests for the same phone and purpose', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({ id: 'recent-otp' });
    const service = new OtpService(prisma as any, config as any);

    await expect(service.createOtp('09121234567', OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      HttpException,
    );
    expect(prisma.otpCode.create).not.toHaveBeenCalled();
  });

  it('increments failed attempts when the OTP hash does not match', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({
      id: 'otp-1',
      code: 'hashed-code',
      attempts: 0,
    });
    mockedBcrypt.compare.mockResolvedValue(false as never);
    const service = new OtpService(prisma as any, config as any);

    await expect(
      service.validateOtp('09121234567', '000000', OtpPurpose.LOGIN),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.otpCode.update).toHaveBeenCalledWith({
      where: { id: 'otp-1' },
      data: { attempts: { increment: 1 } },
    });
  });

  it('invalidates an OTP that could not be delivered', async () => {
    const service = new OtpService(prisma as any, config as any);

    await service.invalidateOtp('09121234567', OtpPurpose.LOGIN);

    expect(prisma.otpCode.updateMany).toHaveBeenCalledWith({
      where: { phone: '09121234567', purpose: OtpPurpose.LOGIN, usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
  });
});
