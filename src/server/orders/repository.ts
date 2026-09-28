import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { OrderLine, OrderStatus, PaymentMethodId, ShippingDetails } from "@/lib/commerce/types";

export interface OrderRecord {
  id: string;
  /** Random secret that lets the buyer (and only the buyer) view the order. */
  accessKey: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  lines: OrderLine[];
  gross: number;
  discounts: { label: string; amount: number }[];
  shipping: { id: string; label: string; price: number };
  total: number;
  currency: "ILS";
  customer: ShippingDetails;
  paymentMethod: PaymentMethodId;
  /** No card data is ever stored — only the provider's reference for this payment. */
  payment: { provider: string; reference?: string; failureReason?: string };
  confirmationEmail: "pending" | "sent" | "not_configured" | "failed";
}

/**
 * Storage for orders. The default implementation writes one JSON file per order, which suits a single
 * Node server (`next start`, a VPS, Docker with a volume). On serverless hosting (e.g. Vercel) the
 * filesystem is not persistent — implement this interface over a database before going live there.
 */
export interface OrderRepository {
  create(order: OrderRecord): Promise<void>;
  get(id: string): Promise<OrderRecord | null>;
  /** Atomic read-modify-write. Return null from `mutate` to leave the order unchanged. */
  update(id: string, mutate: (order: OrderRecord) => OrderRecord | null): Promise<OrderRecord | null>;
}

const ID_PATTERN = /^SN-\d{6}-[A-Z0-9]{6}$/;

export function isOrderId(id: string) {
  return ID_PATTERN.test(id);
}

class FileOrderRepository implements OrderRepository {
  private locks = new Map<string, Promise<unknown>>();

  constructor(private dir: string) {}

  private file(id: string) {
    if (!isOrderId(id)) throw new Error("Invalid order id");
    return path.join(this.dir, `${id}.json`);
  }

  private async write(order: OrderRecord) {
    await fs.mkdir(this.dir, { recursive: true });
    const target = this.file(order.id);
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(order, null, 2), { encoding: "utf8", mode: 0o600 });
    await fs.rename(tmp, target);
  }

  private withLock<T>(id: string, task: () => Promise<T>): Promise<T> {
    const prev = this.locks.get(id) ?? Promise.resolve();
    const next = prev.then(task, task);
    this.locks.set(id, next.catch(() => {}));
    return next;
  }

  async create(order: OrderRecord) {
    await this.withLock(order.id, () => this.write(order));
  }

  async get(id: string) {
    if (!isOrderId(id)) return null;
    try {
      return JSON.parse(await fs.readFile(this.file(id), "utf8")) as OrderRecord;
    } catch {
      return null;
    }
  }

  update(id: string, mutate: (order: OrderRecord) => OrderRecord | null) {
    return this.withLock(id, async () => {
      const current = await this.get(id);
      if (!current) return null;
      const next = mutate(current);
      if (!next) return current;
      const saved = { ...next, updatedAt: new Date().toISOString() };
      await this.write(saved);
      return saved;
    });
  }
}

const globalForOrders = globalThis as unknown as { __orders?: OrderRepository };

export function orders(): OrderRepository {
  globalForOrders.__orders ??= new FileOrderRepository(process.env.ORDER_STORE_DIR || path.join(process.cwd(), ".data", "orders"));
  return globalForOrders.__orders;
}
