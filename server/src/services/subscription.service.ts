/**
 * Subscription Service — NORMX Legal
 * Gere les abonnements par produit (trial, pro, enterprise)
 */

import pool from "../db/pool";

export interface Subscription {
  id: string;
  keycloak_sub: string;
  email: string | null;
  plan: string;
  status: string;
  trial_start: Date | null;
  trial_end: Date | null;
  current_period_start: Date | null;
  current_period_end: Date | null;
  documents_used: number;
  documents_limit: number;
  questions_used: number;
  questions_limit: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: string;
  status: string;
  daysRemaining: number | null;
  documentsUsed: number;
  documentsLimit: number;
  questionsUsed: number;
  questionsLimit: number;
}

/**
 * Retourne ou cree un abonnement trial pour un utilisateur
 */
export async function getOrCreateSubscription(
  keycloakSub: string,
  email?: string
): Promise<Subscription> {
  // Chercher un abonnement existant
  const existing = await pool.query(
    `SELECT * FROM public.product_subscriptions WHERE keycloak_sub = $1`,
    [keycloakSub]
  );

  if (existing.rows.length > 0) {
    const sub = existing.rows[0] as Subscription;

    // Auto-expire les trials depasses
    if (sub.plan === "trial" && sub.status === "ACTIVE" && sub.trial_end) {
      if (new Date() > new Date(sub.trial_end)) {
        await pool.query(
          `UPDATE public.product_subscriptions SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`,
          [sub.id]
        );
        sub.status = "EXPIRED";
      }
    }

    return sub;
  }

  // Creer un abonnement trial
  const result = await pool.query(
    `INSERT INTO public.product_subscriptions (keycloak_sub, email, plan, status)
     VALUES ($1, $2, 'trial', 'ACTIVE')
     RETURNING *`,
    [keycloakSub, email || null]
  );

  return result.rows[0] as Subscription;
}

/**
 * Verifie si l'abonnement est actif
 */
export async function checkSubscriptionActive(
  keycloakSub: string
): Promise<SubscriptionStatus> {
  const result = await pool.query(
    `SELECT * FROM public.product_subscriptions WHERE keycloak_sub = $1`,
    [keycloakSub]
  );

  if (result.rows.length === 0) {
    return {
      active: false,
      plan: "none",
      status: "NOT_FOUND",
      daysRemaining: null,
      documentsUsed: 0,
      documentsLimit: 0,
      questionsUsed: 0,
      questionsLimit: 0,
    };
  }

  const sub = result.rows[0] as Subscription;

  // Auto-expire trials
  if (sub.plan === "trial" && sub.status === "ACTIVE" && sub.trial_end) {
    if (new Date() > new Date(sub.trial_end)) {
      await pool.query(
        `UPDATE public.product_subscriptions SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`,
        [sub.id]
      );
      sub.status = "EXPIRED";
    }
  }

  let daysRemaining: number | null = null;
  if (sub.plan === "trial" && sub.trial_end) {
    const diff = new Date(sub.trial_end).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    active: sub.status === "ACTIVE",
    plan: sub.plan,
    status: sub.status,
    daysRemaining,
    documentsUsed: sub.documents_used,
    documentsLimit: sub.documents_limit,
    questionsUsed: sub.questions_used,
    questionsLimit: sub.questions_limit,
  };
}

/**
 * Active un plan pour un utilisateur (usage admin)
 */
export async function activateSubscription(
  keycloakSub: string,
  plan: string,
  documentsLimit: number = -1,
  questionsLimit: number = -1
): Promise<Subscription> {
  const result = await pool.query(
    `UPDATE public.product_subscriptions
     SET plan = $2,
         status = 'ACTIVE',
         documents_limit = $3,
         questions_limit = $4,
         current_period_start = NOW(),
         current_period_end = NULL,
         updated_at = NOW()
     WHERE keycloak_sub = $1
     RETURNING *`,
    [keycloakSub, plan, documentsLimit, questionsLimit]
  );

  if (result.rows.length === 0) {
    throw new Error(`Subscription not found for keycloak_sub: ${keycloakSub}`);
  }

  return result.rows[0] as Subscription;
}
