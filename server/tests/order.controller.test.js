import { describe, it, expect, vi, beforeEach } from 'vitest';

const querySpy = vi.fn(() => Promise.resolve({ rows: [{ id: 101, order_id: "ORD-123", total_amt: 450 }] }));

// Fake the DB module before importing the controller
vi.mock('../config/connectDB.js', () => ({
  pool: {
    connect: vi.fn(() => ({
      query: querySpy,
      release: vi.fn(),
    })),
  },
}));

// Fake the product fetcher so we don't need a real DB
vi.mock('../models/product.model.js', () => ({
  getProductById: vi.fn(() =>
    Promise.resolve({ id: 1, name: 'Fake Product', price: 500, discount: 10, image: [] }) 
  ),
}));

// Mock socket.io since the controller emits events
vi.mock('../index.js', () => ({
  io: {
    emit: vi.fn(),
  },
}));

import { pricewithDiscount, CashOnDeliveryOrderController } from '../controllers/order.controller.js';

describe('pricewithDiscount', () => {
  it('applies a percentage discount correctly', () => {
    expect(pricewithDiscount(100, 10)).toBe(90);
  });

  it('returns full price when discount is 0', () => {
    expect(pricewithDiscount(100, 0)).toBe(100);
  });

  it('handles 100% discount', () => {
    expect(pricewithDiscount(100, 100)).toBe(0);
  });

  it('rounds correctly for odd numbers', () => {
    // Backend uses Math.ceil((99 * 33) / 100) = Math.ceil(32.67) = 33.
    // 99 - 33 = 66
    expect(pricewithDiscount(99, 33)).toBe(66);
  });
});

describe('CashOnDeliveryOrderController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects request with no list_items', async () => {
    const req = { userId: 1, body: { addressId: 5 } }; // missing list_items
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await CashOnDeliveryOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
    }));
  });

  it('uses server-side product price, not client-submitted price', async () => {
    const req = {
      userId: 1,
      body: {
        addressId: 5,
        list_items: [
          { productId: { id: 1, price: 1 }, quantity: 1 }, // attacker tries to inject price: 1
        ],
      },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await CashOnDeliveryOrderController(req, res);

    // Verify it succeeded
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));

    // Extract the SQL insert call
    const insertCall = querySpy.mock.calls.find(call => call[0].includes('INSERT INTO orders'));
    expect(insertCall).toBeDefined();
    
    // orderValues = [userId, orderId, productId, details, paymentId, paymentStatus, addressId, subtotal, total, invoice]
    const orderValues = insertCall[1];
    const subtotalAmt = orderValues[7];
    
    // Assert the real DB price (500, minus 10% discount = 450) was used,
    // completely ignoring the attacker's price of 1!
    expect(subtotalAmt).toBe(450);
  });
});
