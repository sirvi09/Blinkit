import { pricewithDiscount } from '../controllers/order.controller.js';

describe('Order Controller', () => {
    describe('pricewithDiscount', () => {
        it('should calculate the correct price with discount', () => {
            const price = 1000;
            const discount = 10; // 10%
            const expectedPrice = 900;
            
            const result = pricewithDiscount(price, discount);
            expect(result).toBe(expectedPrice);
        });

        it('should handle zero discount', () => {
            const price = 500;
            const discount = 0;
            
            const result = pricewithDiscount(price, discount);
            expect(result).toBe(500);
        });
        
        it('should apply 1% discount by default if not provided', () => {
            const price = 100;
            
            const result = pricewithDiscount(price);
            expect(result).toBe(99);
        });
    });
});
