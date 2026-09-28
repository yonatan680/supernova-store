import "server-only";
import type { OrderRecord } from "./orders/repository";

/**
 * Order-confirmation email. Called exactly once, when an order first becomes `paid`.
 * No email service is configured yet (SUPERNOVA has no published contact email), so this reports
 * "not_configured". To enable: pick a transactional email service (Resend, Postmark, SendGrid, Amazon SES…),
 * set EMAIL_API_KEY / EMAIL_FROM on the server and send `order` from here.
 */
export async function sendOrderConfirmation(order: OrderRecord): Promise<OrderRecord["confirmationEmail"]> {
  if (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM) {
    console.info(`[orders] ${order.id} paid — confirmation email not sent (email service not configured)`);
    return "not_configured";
  }
  console.warn(`[orders] ${order.id} paid — EMAIL_API_KEY is set but no email adapter is implemented in src/server/notifications.ts`);
  return "failed";
}
