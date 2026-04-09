import { ScrollView, View, Text, TouchableOpacity, Platform, Image } from "react-native";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";
import { useResponsive } from "@/lib/hooks/useResponsive";

function useInjectAnimations() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const id = "normx-legal-hero-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes heroFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes heroSlideRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes heroSlideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes heroPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); } 50% { box-shadow: 0 0 12px 2px rgba(212,168,67,0.12); } }
      @keyframes heroFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes heroGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      @keyframes heroSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes heroScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      @keyframes heroShimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }

      /* Scroll reveal — animations qui se déclenchent au scroll */
      .lp-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
      .lp-reveal.visible { opacity: 1; transform: translateY(0); }
      .lp-reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s ease, transform 0.8s ease; }
      .lp-reveal-left.visible { opacity: 1; transform: translateX(0); }
      .lp-reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
      .lp-reveal-right.visible { opacity: 1; transform: translateX(0); }
      .lp-reveal-scale { opacity: 0; transform: scale(0.92); transition: opacity 0.7s ease, transform 0.7s ease; }
      .lp-reveal-scale.visible { opacity: 1; transform: scale(1); }

      /* Hover effects */
      .lp-cta-btn { transition: all 0.25s ease; }
      .lp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(212,168,67,0.25); }
      .lp-feature-mockup { transition: transform 0.4s ease, box-shadow 0.4s ease; }
      .lp-feature-mockup:hover { transform: translateY(-4px); }

      /* Floating decorative blobs */
      .lp-blob { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; animation: heroFloat 6s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    // Intersection observer pour scroll reveal
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      }, { threshold: 0.15 });
      const reveals = document.querySelectorAll(".lp-reveal, .lp-reveal-left, .lp-reveal-right, .lp-reveal-scale");
      reveals.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, []);
}

const PRIMARY = "#D4A843";
const DARK = "#1A3A5C";
const TEXT_SEC = "#6b7280";
const GREEN = "#059669";
const BG_WARM = "#faf8f5";

const STATS = [
  { value: "59", label: "Modèles de documents" },
  { value: "OHADA", label: "Droit des affaires" },
  { value: "IA", label: "Assistant juridique" },
  { value: "PDF", label: "Export immédiat" },
];

function FeatureSection({
  isMobile, reverse, label, labelColor, title, description, checks,
  mockupIcon, mockupColor, mockupTitle, mockupLines,
}: {
  isMobile: boolean; reverse?: boolean; label: string; labelColor: string;
  title: string; description: string; checks: string[];
  mockupIcon: keyof typeof Ionicons.glyphMap; mockupColor: string;
  mockupTitle: string; mockupLines: string[];
}) {
  const content = (
    <View>
      <Text style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: labelColor, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{label}</Text>
      <Text style={{ fontSize: isMobile ? 24 : 32, fontFamily: fonts.black, fontWeight: fontWeights.black, color: DARK, lineHeight: isMobile ? 30 : 40, marginBottom: 16 }}>{title}</Text>
      <Text style={{ fontSize: 15, color: TEXT_SEC, lineHeight: 24, marginBottom: 24, fontFamily: fonts.regular }}>{description}</Text>
      {checks.map((c, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <Ionicons name="checkmark-circle" size={20} color={GREEN} style={{ marginTop: 2 }} />
          <Text style={{ fontSize: 15, color: DARK, fontFamily: fonts.regular, flex: 1 }}>{c}</Text>
        </View>
      ))}
    </View>
  );

  const mockup = (
    <View style={{ width: "100%", maxWidth: 480 }}>
      {/* MacBook Air frame */}
      <View style={{ backgroundColor: "#e2e2e2", borderRadius: 14, padding: 6, paddingBottom: 0, borderWidth: 1, borderColor: "#d4d4d4" }}>
        {/* Caméra notch */}
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#1a1a1a", alignSelf: "center", marginBottom: 4, borderWidth: 1, borderColor: "#333" }} />
        {/* Ecran */}
        <View style={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
          {/* Topbar */}
          <View style={{ backgroundColor: DARK, height: 30, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#ef4444" }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#f59e0b" }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" }} />
            <Text style={{ flex: 1, textAlign: "center", fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.6)" }}>{mockupTitle}</Text>
          </View>
          {/* Content */}
          <View style={{ padding: 14 }}>
            {/* Header avec icône */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${mockupColor}15`, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={mockupIcon} size={16} color={mockupColor} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "800", color: DARK }}>{mockupTitle}</Text>
              </View>
              <View style={{ paddingVertical: 2, paddingHorizontal: 8, backgroundColor: `${mockupColor}15`, borderRadius: 4 }}>
                <Text style={{ fontSize: 8, fontWeight: "700", color: mockupColor }}>OHADA</Text>
              </View>
            </View>
            {/* Table */}
            <View style={{ backgroundColor: "#f9fafb", borderRadius: 4, overflow: "hidden" }}>
              <View style={{ flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#f3f4f6" }}>
                <Text style={{ flex: 2, fontSize: 8, fontWeight: "700", color: TEXT_SEC, letterSpacing: 0.3 }}>RUBRIQUE</Text>
                <Text style={{ flex: 1, fontSize: 8, fontWeight: "700", color: TEXT_SEC, textAlign: "right", letterSpacing: 0.3 }}>VALEUR</Text>
              </View>
              {mockupLines.map((line, i) => (
                <View key={i} style={{ flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
                  <Text style={{ flex: 2, fontSize: 9, color: "#374151" }}>{line.split("|")[0]}</Text>
                  <Text style={{ flex: 1, fontSize: 9, fontWeight: "600", color: i === 0 ? mockupColor : DARK, textAlign: "right" }}>{line.split("|")[1] || ""}</Text>
                </View>
              ))}
            </View>
            {/* Footer */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, padding: 6, backgroundColor: "#f9fafb", borderRadius: 4 }}>
              <Text style={{ fontSize: 9, color: TEXT_SEC }}>Document généré</Text>
              <Text style={{ fontSize: 9, fontWeight: "700", color: GREEN }}>Conforme ✓</Text>
            </View>
          </View>
        </View>
      </View>
      {/* MacBook Air base */}
      <View style={{ height: 8, backgroundColor: "#d1d1d1", borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginHorizontal: 20 }}>
        <View style={{ width: 60, height: 3, backgroundColor: "#b0b0b0", borderBottomLeftRadius: 2, borderBottomRightRadius: 2, alignSelf: "center" }} />
      </View>
      {/* Ombre */}
      <View style={{ height: 4, marginHorizontal: 40, ...(Platform.OS === "web" ? { background: "radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 70%)" } as Record<string, string> : {}) }} />
    </View>
  );

  const webProps = (cls: string) => Platform.OS === "web" ? ({ className: cls } as Record<string, unknown>) : {};

  return (
    <View style={{ flexDirection: isMobile ? "column" : (reverse ? "row-reverse" : "row"), gap: isMobile ? 32 : 60, paddingVertical: 64, paddingHorizontal: 16, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
      <View {...webProps(reverse ? "lp-reveal-right" : "lp-reveal-left")} style={{ flex: 1, minWidth: 280 }}>
        {content}
      </View>
      <View {...webProps(reverse ? "lp-reveal-left lp-feature-mockup" : "lp-reveal-right lp-feature-mockup")} style={{ flex: 1, minWidth: 280, alignItems: "center" }}>
        {mockup}
      </View>
    </View>
  );
}

export default function LandingPage() {
  const login = useAuthStore((s) => s.login);
  const { isMobile } = useResponsive();
  useInjectAnimations();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>

      {/* Header — Nav app.normx-ai.com style */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: "rgba(255,255,255,0.92)", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)", ...(Platform.OS === "web" ? { backdropFilter: "blur(20px)" } as Record<string, string> : {}) }}>
        <View style={{ flexDirection: "row", alignItems: "center", height: 64, paddingHorizontal: 16, maxWidth: 1200, width: "100%", alignSelf: "center" }}>
          {/* Logo */}
          <TouchableOpacity onPress={() => Platform.OS === "web" && window.scrollTo({ top: 0, behavior: "smooth" })} style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={require("@/assets/logo-horizontal.png")} style={{ height: 30, width: 130 }} resizeMode="contain" />
          </TouchableOpacity>

          {/* Nav links — droite */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: "auto" as unknown as number }}>
            {!isMobile && (
              <>
                <TouchableOpacity onPress={() => Platform.OS === "web" && window.scrollTo({ top: 700, behavior: "smooth" })} style={{ paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: TEXT_SEC }}>Fonctionnalités</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://normx-ai.com#products", "_blank")} style={{ paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: TEXT_SEC }}>Produits ▾</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={login} style={{ paddingVertical: 9, paddingHorizontal: 22, borderRadius: 8, backgroundColor: DARK }}>
              <Text style={{ color: "#ffffff", fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14 }}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Spacer pour compenser le header fixed */}
      <View style={{ height: 64 }} />

      {/* Hero */}
      <View style={{ paddingTop: isMobile ? 60 : 100, paddingBottom: 60, paddingHorizontal: 16, backgroundColor: BG_WARM, position: "relative", overflow: "hidden" }}>
        {/* Blobs décoratifs */}
        {Platform.OS === "web" && !isMobile && (
          <>
            <View style={{ position: "absolute", top: 80, left: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(212,168,67,0.15)", ...({ filter: "blur(80px)", animationName: "heroFloat", animationDuration: "8s", animationIterationCount: "infinite", animationTimingFunction: "ease-in-out" } as Record<string, string>) }} />
            <View style={{ position: "absolute", bottom: 60, right: -120, width: 380, height: 380, borderRadius: 190, backgroundColor: "rgba(124,58,237,0.10)", ...({ filter: "blur(90px)", animationName: "heroFloat", animationDuration: "10s", animationDelay: "2s", animationIterationCount: "infinite", animationTimingFunction: "ease-in-out" } as Record<string, string>) }} />
            <View style={{ position: "absolute", top: 200, right: 200, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(37,99,235,0.08)", ...({ filter: "blur(60px)", animationName: "heroGlow", animationDuration: "6s", animationIterationCount: "infinite", animationTimingFunction: "ease-in-out" } as Record<string, string>) }} />
          </>
        )}
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? 40 : 60, position: "relative", zIndex: 1 }}>

          {/* MacBook mockup CSS — gauche */}
          {!isMobile && (
            <View style={{ flex: 1, maxWidth: 540 }}>
              {/* MacBook Air frame */}
              <View style={{ backgroundColor: "#e2e2e2", borderRadius: 14, padding: 6, paddingBottom: 0, borderWidth: 1, borderColor: "#d4d4d4", ...(Platform.OS === "web" ? { animationName: "heroPulse", animationDuration: "3s", animationIterationCount: "infinite", animationDelay: "2s", animationTimingFunction: "ease-in-out" } as Record<string, string> : {}) }}>
                {/* Caméra notch */}
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#1a1a1a", alignSelf: "center", marginBottom: 4, borderWidth: 1, borderColor: "#333" }} />
                {/* Ecran */}
                <View style={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                  {/* Topbar mockup */}
                  <View style={{ backgroundColor: DARK, height: 32, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59e0b" }} />
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" }} />
                    <Text style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.6)" }}>NORMX Legal — Statuts SARL</Text>
                  </View>
                  {/* Content */}
                  <View style={{ flexDirection: "row" }}>
                    {/* Sidebar */}
                    <View style={{ width: 110, backgroundColor: DARK, paddingVertical: 10, paddingHorizontal: 8, gap: 5, minHeight: 320 }}>
                      {["Dashboard", "Statuts", "PV & AG", "Cessions", "Bulletins", "Assistant IA", "Mes documents", "Mon profil"].map((item, i) => (
                        <View key={i} style={{ paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4, backgroundColor: i === 1 ? "rgba(212,168,67,0.2)" : "transparent", ...(Platform.OS === "web" ? { animationName: "heroSlideRight", animationDuration: "0.4s", animationFillMode: "both", animationDelay: `${0.2 + i * 0.1}s` } as Record<string, string> : {}) }}>
                          <Text style={{ fontSize: 9, color: i === 1 ? PRIMARY : "rgba(255,255,255,0.5)", fontWeight: i === 1 ? "700" : "400" }}>{item}</Text>
                        </View>
                      ))}
                    </View>
                    {/* Main */}
                    <View style={{ flex: 1, padding: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1f2937", marginBottom: 10 }}>Statuts SARL — OHADA</Text>
                      {/* Stats row */}
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                        {[{ val: "59", lbl: "Modèles", color: PRIMARY }, { val: "OHADA", lbl: "Conforme", color: GREEN }, { val: "PDF", lbl: "Export", color: "#2563eb" }].map((s, i) => (
                          <View key={i} style={{ flex: 1, backgroundColor: "#f9fafb", padding: 8, borderRadius: 4, ...(Platform.OS === "web" ? { animationName: "heroFadeUp", animationDuration: "0.5s", animationFillMode: "both", animationDelay: `${0.3 + i * 0.2}s` } as Record<string, string> : {}) }}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: s.color }}>{s.val}</Text>
                            <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>{s.lbl}</Text>
                          </View>
                        ))}
                      </View>
                      {/* Table */}
                      <View style={{ backgroundColor: "#f9fafb", borderRadius: 4, overflow: "hidden" }}>
                        <View style={{ flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, backgroundColor: "#f3f4f6" }}>
                          <Text style={{ flex: 2, fontSize: 7, fontWeight: "700", color: "#6b7280" }}>RUBRIQUE</Text>
                          <Text style={{ flex: 1, fontSize: 7, fontWeight: "700", color: "#6b7280", textAlign: "right" }}>VALEUR</Text>
                        </View>
                        {[
                          { label: "DENOMINATION SOCIALE", val: "OMEGA SARL", color: "#1f2937" },
                          { label: "FORME JURIDIQUE", val: "SARL", color: PRIMARY },
                          { label: "CAPITAL SOCIAL", val: "5 000 000", color: "#1f2937" },
                          { label: "NOMBRE DE PARTS", val: "500", color: "#1f2937" },
                          { label: "VALEUR NOMINALE", val: "10 000", color: "#1f2937" },
                          { label: "SIEGE SOCIAL", val: "Brazzaville", color: "#1f2937" },
                          { label: "DUREE", val: "99 ans", color: "#1f2937" },
                          { label: "GERANT", val: "M. MABIKA J.", color: PRIMARY },
                          { label: "STATUT", val: "Validé ✓", color: GREEN },
                        ].map((row, i) => (
                          <View key={i} style={{ flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", ...(Platform.OS === "web" ? { animationName: "heroFadeUp", animationDuration: "0.4s", animationFillMode: "both", animationDelay: `${0.8 + i * 0.1}s` } as Record<string, string> : {}) }}>
                            <Text style={{ flex: 2, fontSize: 9, color: "#374151" }}>{row.label}</Text>
                            <Text style={{ flex: 1, fontSize: 9, fontWeight: "600", color: row.color, textAlign: "right" }}>{row.val}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* MacBook Air base — wedge design */}
              <View style={{ height: 8, backgroundColor: "#d1d1d1", borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginHorizontal: 20 }}>
                <View style={{ width: 60, height: 3, backgroundColor: "#b0b0b0", borderBottomLeftRadius: 2, borderBottomRightRadius: 2, alignSelf: "center" }} />
              </View>
              {/* Ombre */}
              <View style={{ height: 4, marginHorizontal: 40, ...(Platform.OS === "web" ? { background: "radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 70%)" } as Record<string, string> : {}) }} />
            </View>
          )}

          {/* Texte — droite */}
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: "rgba(212,168,67,0.1)", borderRadius: 100, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 24, alignSelf: isMobile ? "center" : "flex-start" }}>
              <Text style={{ fontSize: 13, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: PRIMARY, letterSpacing: 0.5 }}>
                La plateforme de génération des documents OHADA
              </Text>
            </View>

            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: isMobile ? 30 : 44, color: DARK, textAlign: isMobile ? "center" : "left", lineHeight: isMobile ? 36 : 52, marginBottom: 16, letterSpacing: -0.5 }}>
              {"Générez vos actes\njuridiques en "}
              <Text style={{ color: PRIMARY }}>quelques clics</Text>
            </Text>

            <Text style={{ fontSize: isMobile ? 15 : 17, color: TEXT_SEC, maxWidth: 480, textAlign: isMobile ? "center" : "left", lineHeight: isMobile ? 24 : 28, fontFamily: fonts.regular, marginBottom: 32 }}>
              59 modèles de documents conformes au droit OHADA — statuts, PV, cessions, convocations, rapports.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 32 }}>
              <TouchableOpacity {...(Platform.OS === "web" ? ({ className: "lp-cta-btn" } as Record<string, unknown>) : {})} onPress={login} style={{ paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, backgroundColor: PRIMARY }}>
                <Text style={{ color: DARK, fontSize: 15, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>Se connecter →</Text>
              </TouchableOpacity>
              <TouchableOpacity {...(Platform.OS === "web" ? ({ className: "lp-cta-btn" } as Record<string, unknown>) : {})} onPress={login} style={{ paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "#ffffff" }}>
                <Text style={{ color: DARK, fontSize: 15, fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold }}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats bar */}
        <View style={{ flexDirection: "row", backgroundColor: DARK, borderRadius: 16, paddingVertical: 24, paddingHorizontal: isMobile ? 16 : 48, width: "100%", maxWidth: 800, alignSelf: "center", marginTop: 48 }}>
          {STATS.map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", borderRightWidth: i < STATS.length - 1 ? 1 : 0, borderRightColor: "rgba(255,255,255,0.15)" }}>
              <Text style={{ fontSize: isMobile ? 20 : 28, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: PRIMARY }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: fonts.medium, fontWeight: fontWeights.medium }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Section 1 — Statuts de societes */}
      <View style={{ backgroundColor: "#ffffff" }}>
        <FeatureSection isMobile={isMobile}
          label="CONSTITUTION DE SOCIÉTÉS" labelColor={PRIMARY}
          title={"Créez vos statuts\nen toute conformité"}
          description="SARL, SARLU, SAS, SASU, SA, SNC, SCS, GIE, Société en participation — tous les modèles conformes à l'Acte uniforme OHADA."
          checks={[
            "Statuts SARL, SARLU, SAS, SASU, SA, SNC, SCS",
            "GIE et société en participation",
            "Clauses personnalisables (objet, capital, durée)",
            "Export Word et PDF instantané",
          ]}
          mockupIcon="document-text-outline" mockupColor={PRIMARY} mockupTitle="Statuts SARL — OHADA"
          mockupLines={[
            "Dénomination|OMEGA SERVICES SARL",
            "Capital social|5 000 000 FCFA",
            "Nombre de parts|500 parts",
            "Siège social|Brazzaville, Congo",
            "Durée|99 ans",
            "Gérant|M. MABIKA Jean",
          ]}
        />
      </View>

      {/* Section 2 — PV et AG */}
      <View style={{ backgroundColor: BG_WARM }}>
        <FeatureSection isMobile={isMobile} reverse
          label="ASSEMBLÉES GÉNÉRALES" labelColor="#2563eb"
          title={"PV, convocations\net feuilles de présence"}
          description="Tous les documents pour vos AG ordinaires et extraordinaires — PV, convocations, feuilles de présence, pouvoirs."
          checks={[
            "PV d'AGO, AGE, dissolution, consultation écrite",
            "Convocations actionnaires, CA, CAC",
            "Feuilles de présence AG et CA",
            "Pouvoirs AG et CA",
          ]}
          mockupIcon="people-outline" mockupColor="#2563eb" mockupTitle="PV AGO — SARL"
          mockupLines={[
            "Type|Assemblée Générale Ordinaire",
            "Date|15 mars 2026",
            "Quorum|75% des parts représentées",
            "Résolution 1|Approbation des comptes",
            "Résolution 2|Affectation du résultat",
            "Vote|Adopté à l'unanimité",
          ]}
        />
      </View>

      {/* Section 3 — Cessions */}
      <View style={{ backgroundColor: "#ffffff" }}>
        <FeatureSection isMobile={isMobile}
          label="CESSIONS ET MUTATIONS" labelColor="#7c3aed"
          title={"Actes de cession\nde parts et d'actions"}
          description="Cession de parts sociales, cession d'actions, bulletins de souscription — conformes aux Actes uniformes OHADA."
          checks={[
            "Acte de cession de parts sociales",
            "Acte de cession d'actions",
            "Bulletins de souscription (constitution et augmentation)",
            "Certificat d'actions nominatives",
          ]}
          mockupIcon="swap-horizontal-outline" mockupColor="#7c3aed" mockupTitle="Cession de parts"
          mockupLines={[
            "Cédant|M. ALPHA Jean",
            "Cessionnaire|Mme BETA Marie",
            "Parts cédées|150 parts",
            "Prix de cession|7 500 000 FCFA",
            "Valeur nominale|50 000 FCFA/part",
            "Agrément|Obtenu le 01/02/2026",
          ]}
        />
      </View>

      {/* Section 4 — Assistant IA */}
      <View style={{ backgroundColor: BG_WARM }}>
        <FeatureSection isMobile={isMobile} reverse
          label="ASSISTANT IA JURIDIQUE" labelColor="#d97706"
          title={"Posez vos questions\nsur le droit OHADA"}
          description="Un assistant IA formé sur les Actes uniformes OHADA, le droit des sociétés et le droit commercial général."
          checks={[
            "Réponses sourcées avec références OHADA",
            "Droit des sociétés commerciales et du GIE",
            "Droit commercial général",
            "Disponible 24h/24",
          ]}
          mockupIcon="chatbubbles-outline" mockupColor="#d97706" mockupTitle="Assistant IA — NORMX Legal"
          mockupLines={[
            "Question|Capital minimum d'une SARL ?",
            "Réponse|1 000 000 FCFA (Art. 311)",
            "Source|Acte uniforme OHADA",
            "Nombre d'associés|Min 2, Max 100",
            "Responsabilité|Limitée aux apports",
          ]}
        />
      </View>

      {/* CTA */}
      <View {...(Platform.OS === "web" ? ({ className: "lp-reveal-scale" } as Record<string, unknown>) : {})} style={{ alignItems: "center", paddingVertical: 80, paddingHorizontal: 16, backgroundColor: "#ffffff", position: "relative", overflow: "hidden" }}>
        {Platform.OS === "web" && (
          <View style={{ position: "absolute", top: 40, left: "50%", marginLeft: -300, width: 600, height: 200, borderRadius: 100, backgroundColor: "rgba(212,168,67,0.12)", ...({ filter: "blur(80px)", animationName: "heroGlow", animationDuration: "5s", animationIterationCount: "infinite" } as Record<string, string>) }} />
        )}
        <View style={{ backgroundColor: BG_WARM, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", borderRadius: 24, padding: 48, maxWidth: 700, width: "100%", alignItems: "center", position: "relative", zIndex: 1, ...(Platform.OS === "web" ? { boxShadow: "0 20px 60px rgba(0,0,0,0.08)" } as Record<string, string> : {}) }}>
          <Text style={{ fontFamily: fonts.black, fontWeight: fontWeights.black, fontSize: 28, color: DARK, textAlign: "center", marginBottom: 12 }}>
            Prêt à simplifier vos actes juridiques ?
          </Text>
          <Text style={{ color: TEXT_SEC, fontSize: 16, fontFamily: fonts.regular, marginBottom: 28, textAlign: "center" }}>
            59 modèles conformes OHADA, génération instantanée en Word et PDF.
          </Text>
          <TouchableOpacity {...(Platform.OS === "web" ? ({ className: "lp-cta-btn" } as Record<string, unknown>) : {})} onPress={login} style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 10, backgroundColor: PRIMARY }}>
            <Text style={{ color: DARK, fontSize: 16, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>Se connecter →</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 16, fontSize: 13, color: "#9ca3af", fontFamily: fonts.regular }}>Connexion sécurisée via NORMX AI</Text>
        </View>
      </View>

      {/* Footer style app.normx-ai.com */}
      <View style={{ backgroundColor: "#0F2A42", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 48, paddingHorizontal: 16 }}>
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 32 : 32, flexWrap: "wrap" }}>
          {/* Brand */}
          <View style={{ flex: isMobile ? undefined : 1.5, minWidth: 240, marginBottom: isMobile ? 24 : 0 }}>
            <Text style={{ fontSize: 19, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: "#e8e6e1", marginBottom: 8 }}>
              NORMX <Text style={{ color: PRIMARY }}>AI</Text>
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 21, fontFamily: fonts.regular }}>
              Plateforme d'intelligence comptable, fiscale, sociale et juridique pour les professionnels africains.
            </Text>
          </View>
          {/* Produits */}
          <View style={{ flex: isMobile ? undefined : 1, minWidth: 140, marginBottom: isMobile ? 24 : 0 }}>
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: "#e8e6e1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Produits</Text>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://app.normx-ai.com", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>NORMX Finance</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://tax.normx-ai.com", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>NORMX Tax</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://legal.normx-ai.com", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>NORMX Legal</Text></TouchableOpacity>
          </View>
          {/* Contact */}
          <View style={{ flex: isMobile ? undefined : 1, minWidth: 220, marginBottom: isMobile ? 24 : 0 }}>
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: "#e8e6e1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Contact</Text>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("mailto:info-contact@normx-ai.com")}><Text style={{ fontSize: 14, color: PRIMARY, paddingVertical: 3, fontFamily: fonts.regular }}>info-contact@normx-ai.com</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("mailto:support@normx-ai.com")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>support@normx-ai.com</Text></TouchableOpacity>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", paddingVertical: 3, fontFamily: fonts.regular }}>71 rue Daire, 80000 Amiens</Text>
          </View>
          {/* Legal */}
          <View style={{ flex: isMobile ? undefined : 1, minWidth: 160 }}>
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: "#e8e6e1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Legal</Text>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://tax.normx-ai.com/legal/cgu", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>Conditions générales</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://tax.normx-ai.com/legal/confidentialite", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>Politique de confidentialité</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === "web" && window.open("https://tax.normx-ai.com/legal/mentions", "_blank")}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 3, fontFamily: fonts.regular }}>Mentions légales</Text></TouchableOpacity>
          </View>
        </View>
        {/* Footer bottom */}
        <View style={{ marginTop: 40, paddingVertical: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: fonts.regular }}>
            © 2026 NORMX AI SAS — 71 rue Daire, 80000 Amiens, France
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
