import { of, lastValueFrom } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor();
  const context = {} as any;

  it('wraps a regular response in the shared API contract', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(context, { handle: () => of({ id: 'salon-1' }) }),
    );
    expect(result).toEqual({ success: true, data: { id: 'salon-1' } });
  });

  it('preserves paginated data and metadata', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () =>
          of({
            data: [{ id: 'salon-1' }],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          }),
      }),
    );
    expect(result).toEqual({
      success: true,
      data: [{ id: 'salon-1' }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it('does not wrap an existing API response twice', async () => {
    const existing = { success: true, data: { status: 'ok' } };
    const result = await lastValueFrom(
      interceptor.intercept(context, { handle: () => of(existing) }),
    );
    expect(result).toBe(existing);
  });
});
