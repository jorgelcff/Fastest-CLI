/**
 * Example: e-commerce order service used for demonstrating Fastest CLI.
 *
 * This module contains realistic business logic with multiple rules,
 * error paths, and edge cases — making it a good candidate for AI-powered
 * test generation.
 */

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export class OrderService {
  private orders: Map<string, Order> = new Map();

  /**
   * Creates a new order from a list of cart items.
   * Validates stock availability and applies the discount.
   * Discount must be between 0 and 100 (percentage).
   * Throws if the cart is empty or any item has insufficient stock.
   */
  createOrder(items: CartItem[], discountPercent = 0): Order {
    if (items.length === 0) {
      throw new Error('Cart is empty. Add at least one item before placing an order.');
    }

    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error(`Invalid discount: ${discountPercent}. Must be between 0 and 100.`);
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product "${item.product.name}": must be greater than zero.`);
      }
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.product.name}": requested ${item.quantity}, available ${item.product.stock}.`,
        );
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discount = (subtotal * discountPercent) / 100;
    const total = parseFloat((subtotal - discount).toFixed(2));

    const order: Order = {
      id: `ORD-${Date.now()}`,
      items,
      discount,
      total,
      status: 'pending',
    };

    this.orders.set(order.id, order);
    return order;
  }

  /**
   * Confirms a pending order.
   * Throws if the order does not exist or is not in pending status.
   */
  confirmOrder(orderId: string): Order {
    const order = this.getOrderOrThrow(orderId);
    if (order.status !== 'pending') {
      throw new Error(`Cannot confirm order "${orderId}": current status is "${order.status}".`);
    }
    order.status = 'confirmed';
    return order;
  }

  /**
   * Cancels a pending or confirmed order.
   * Returns the cancelled order.
   * Throws if the order is already cancelled.
   */
  cancelOrder(orderId: string): Order {
    const order = this.getOrderOrThrow(orderId);
    if (order.status === 'cancelled') {
      throw new Error(`Order "${orderId}" is already cancelled.`);
    }
    order.status = 'cancelled';
    return order;
  }

  /**
   * Retrieves an order by ID.
   * Throws if not found.
   */
  getOrder(orderId: string): Order {
    return this.getOrderOrThrow(orderId);
  }

  /**
   * Calculates the subtotal of a cart without creating an order.
   */
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  /**
   * Returns all orders with the given status.
   */
  getOrdersByStatus(status: Order['status']): Order[] {
    return Array.from(this.orders.values()).filter(o => o.status === status);
  }

  private getOrderOrThrow(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order "${orderId}" not found.`);
    }
    return order;
  }
}
