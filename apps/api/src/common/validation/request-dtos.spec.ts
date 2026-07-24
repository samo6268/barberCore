import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBookingDto } from '../../modules/booking/booking.service';
import { CreateServiceDto } from '../../modules/services/services.service';
import { CreateStaffDto } from '../../modules/staff/staff.service';
import { UpdateProfileDto } from '../../modules/users/users.service';

const UUID_1 = '11111111-1111-4111-8111-111111111111';
const UUID_2 = '22222222-2222-4222-8222-222222222222';

async function validateRequest<T extends object>(type: new () => T, value: object) {
  return validate(plainToInstance(type, value), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('MVP request DTOs', () => {
  it('accepts the booking payload sent by the web application', async () => {
    const errors = await validateRequest(CreateBookingDto, {
      salonId: UUID_1,
      serviceIds: [UUID_2],
      date: '2030-01-10',
      time: '10:30',
      notes: 'رزرو آزمایشی',
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts the service payload sent by the owner dashboard', async () => {
    const errors = await validateRequest(CreateServiceDto, {
      name: 'کوتاهی مو',
      categoryId: UUID_1,
      durationMinutes: 45,
      price: 500_000,
      isOnlineBookable: true,
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts the staff payload sent by the owner dashboard', async () => {
    const errors = await validateRequest(CreateStaffDto, {
      phone: '09121234567',
      displayName: 'محمد رضایی',
      serviceIds: [UUID_1],
      commissionRate: 20,
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects unknown and malformed booking fields', async () => {
    const errors = await validateRequest(CreateBookingDto, {
      salonId: 'not-a-uuid',
      serviceIds: [],
      date: '2030-99-99',
      time: 'invalid',
      unexpected: true,
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('validates profile updates before they reach Prisma', async () => {
    const valid = await validateRequest(UpdateProfileDto, {
      firstName: 'محمد',
      lastName: 'رضایی',
      email: 'mohammad@example.com',
    });
    const invalid = await validateRequest(UpdateProfileDto, {
      firstName: '',
      email: 'invalid-email',
    });
    expect(valid).toHaveLength(0);
    expect(invalid.length).toBeGreaterThan(0);
  });
});
