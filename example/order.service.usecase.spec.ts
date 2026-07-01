import { OrderService, CartItem, Product, Order } from './order.service';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 2 }];
      const order = orderService.createOrder(items, 10);

      expect(order.id).toMatch(/^ORD-\d+$/);
      expect(order.items).toEqual(items);
      expect(order.discount).toBe(20);
      expect(order.total).toBe(180);
      expect(order.status).toBe('pending');
    });

    it('should throw an error if the cart is empty', () => {
      expect(() => orderService.createOrder([], 0)).toThrow('Cart is empty. Add at least one item before placing an order.');
    });

    it('should throw an error for invalid discount', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      expect(() => orderService.createOrder(items, -1)).toThrow('Invalid discount: -1. Must be between 0 and 100.');
      expect(() => orderService.createOrder(items, 101)).toThrow('Invalid discount: 101. Must be between 0 and 100.');
    });

    it('should throw an error for invalid quantity', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 0 }];
      expect(() => orderService.createOrder(items, 0)).toThrow('Invalid quantity for product "Product A": must be greater than zero.');
    });

    it('should throw an error for insufficient stock', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 1 };
      const items: CartItem[] = [{ product, quantity: 2 }];
      expect(() => orderService.createOrder(items, 0)).toThrow('Insufficient stock for "Product A": requested 2, available 1.');
    });
  });

  describe('confirmOrder', () => {
    it('should confirm a pending order successfully', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      const order = orderService.createOrder(items, 0);
      const confirmedOrder = orderService.confirmOrder(order.id);

      expect(confirmedOrder.status).toBe('confirmed');
    });

    it('should throw an error if the order does not exist', () => {
      expect(() => orderService.confirmOrder('ORD-999')).toThrow('Order "ORD-999" not found.');
    });

    it('should throw an error if the order is not pending', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      const order = orderService.createOrder(items, 0);
      orderService.confirmOrder(order.id);

      expect(() => orderService.confirmOrder(order.id)).toThrow(`Cannot confirm order "${order.id}": current status is "confirmed".`);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order successfully', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      const order = orderService.createOrder(items, 0);
      const cancelledOrder = orderService.cancelOrder(order.id);

      expect(cancelledOrder.status).toBe('cancelled');
    });

    it('should throw an error if the order does not exist', () => {
      expect(() => orderService.cancelOrder('ORD-999')).toThrow('Order "ORD-999" not found.');
    });

    it('should throw an error if the order is already cancelled', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      const order = orderService.createOrder(items, 0);
      orderService.cancelOrder(order.id);

      expect(() => orderService.cancelOrder(order.id)).toThrow(`Order "${order.id}" is already cancelled.`);
    });
  });

  describe('getOrder', () => {
    it('should retrieve an existing order successfully', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      const order = orderService.createOrder(items, 0);
      const retrievedOrder = orderService.getOrder(order.id);

      expect(retrievedOrder).toEqual(order);
    });

    it('should throw an error if the order does not exist', () => {
      expect(() => orderService.getOrder('ORD-999')).toThrow('Order "ORD-999" not found.');
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate the subtotal of cart items', () => {
      const productA: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const productB: Product = { id: '2', name: 'Product B', price: 50, stock: 5 };
      const items: CartItem[] = [
        { product: productA, quantity: 2 },
        { product: productB, quantity: 3 },
      ];
      const subtotal = orderService.calculateSubtotal(items);

      expect(subtotal).toBe(350);
    });

    it('should return 0 for an empty cart', () => {
      const subtotal = orderService.calculateSubtotal([]);

      expect(subtotal).toBe(0);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return orders with the specified status', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      orderService.createOrder(items, 0);
      const order2 = orderService.createOrder(items, 0);
      orderService.confirmOrder(order2.id);

      const pendingOrders = orderService.getOrdersByStatus('pending');
      const confirmedOrders = orderService.getOrdersByStatus('confirmed');

      expect(pendingOrders.length).toBe(1);
      expect(confirmedOrders.length).toBe(1);
    });

    it('should return an empty array if no orders match the status', () => {
      const product: Product = { id: '1', name: 'Product A', price: 100, stock: 10 };
      const items: CartItem[] = [{ product, quantity: 1 }];
      orderService.createOrder(items, 0);
      orderService.confirmOrder('ORD-1');

      const cancelledOrders = orderService.getOrdersByStatus('cancelled');

      expect(cancelledOrders.length).toBe(0);
    });
  });
});