-- CreateEnum
CREATE TYPE "CheckoutEventType" AS ENUM ('created', 'updated', 'payment_approved', 'payment_changed', 'order_linked', 'status_changed');

-- CreateTable
CREATE TABLE "checkout_notification_events" (
    "id" UUID NOT NULL,
    "checkout_lead_id" UUID NOT NULL,
    "event_key" TEXT NOT NULL,
    "event_type" "CheckoutEventType" NOT NULL,
    "customer_name" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "previous_updated_at" TIMESTAMPTZ(6),
    "checkout_updated_at" TIMESTAMPTZ(6) NOT NULL,
    "payload" JSONB,
    "notified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkout_notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_notification_events_event_key_key" ON "checkout_notification_events"("event_key");

-- CreateIndex
CREATE INDEX "checkout_notification_events_checkout_lead_id_idx" ON "checkout_notification_events"("checkout_lead_id");

-- CreateIndex
CREATE INDEX "checkout_notification_events_event_type_idx" ON "checkout_notification_events"("event_type");

-- CreateIndex
CREATE INDEX "checkout_notification_events_checkout_updated_at_idx" ON "checkout_notification_events"("checkout_updated_at");

-- CreateIndex
CREATE INDEX "checkout_notification_events_notified_at_idx" ON "checkout_notification_events"("notified_at");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_active_idx" ON "push_subscriptions"("active");
