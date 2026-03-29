/**
 * Routes Subscription — NORMX Legal
 * GET /api/subscription/status — statut abonnement courant
 * POST /api/subscription/activate — activer un plan (admin)
 */

import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import {
  checkSubscriptionActive,
  activateSubscription,
} from "../services/subscription.service";

const router = Router();

// Toutes les routes requierent l'auth
router.use(requireAuth());

/**
 * GET /api/subscription/status
 */
router.get("/status", async (req: AuthRequest, res: Response) => {
  try {
    const status = await checkSubscriptionActive(req.keycloakSub!);
    res.json(status);
  } catch (err) {
    console.error("[subscription] Error getting status:", err);
    res.status(500).json({ error: "Erreur interne" });
  }
});

/**
 * POST /api/subscription/activate
 * Body: { keycloakSub, plan, documentsLimit?, questionsLimit? }
 * Admin only
 */
router.post("/activate", async (req: AuthRequest, res: Response) => {
  try {
    // Verifier que l'utilisateur est admin
    const roles = req.userRoles || [];
    if (!roles.includes("admin")) {
      return res.status(403).json({ error: "Acces reserve aux administrateurs" });
    }

    const { keycloakSub, plan, documentsLimit, questionsLimit } = req.body;
    if (!keycloakSub || !plan) {
      return res.status(400).json({ error: "keycloakSub et plan requis" });
    }

    const subscription = await activateSubscription(
      keycloakSub,
      plan,
      documentsLimit ?? -1,
      questionsLimit ?? -1
    );
    res.json(subscription);
  } catch (err) {
    console.error("[subscription] Error activating:", err);
    res.status(500).json({ error: "Erreur interne" });
  }
});

export const subscriptionRoutes = router;
