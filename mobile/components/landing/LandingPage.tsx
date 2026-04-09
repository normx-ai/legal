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
      @keyframes heroPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); } 50% { box-shadow: 0 0 12px 2px rgba(212,168,67,0.12); } }
    `;
    document.head.appendChild(style);
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
    <View style={{ flex: 1, minWidth: 280 }}>
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
    <View style={{ flex: 1, minWidth: 280 }}>
      <View style={{ backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, overflow: "hidden" }}>
        <View style={{ height: 36, backgroundColor: "#f3f4f6", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#f59e0b" }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e" }} />
        </View>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${mockupColor}15`, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={mockupIcon} size={20} color={mockupColor} />
            </View>
            <Text style={{ fontSize: 14, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: DARK }}>{mockupTitle}</Text>
          </View>
          {mockupLines.map((line, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
              <Text style={{ fontSize: 12, color: TEXT_SEC, fontFamily: fonts.regular }}>{line.split("|")[0]}</Text>
              <Text style={{ fontSize: 12, color: DARK, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>{line.split("|")[1] || ""}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flexDirection: isMobile ? "column" : (reverse ? "row-reverse" : "row"), gap: isMobile ? 32 : 60, paddingVertical: 48, paddingHorizontal: 24, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
      {content}
      {mockup}
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
        <View style={{ flexDirection: "row", alignItems: "center", height: 64, paddingHorizontal: 24, maxWidth: 1200, width: "100%", alignSelf: "center" }}>
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
      <View style={{ paddingTop: isMobile ? 60 : 100, paddingBottom: 60, paddingHorizontal: 24, backgroundColor: BG_WARM }}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? 40 : 60 }}>

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
              <TouchableOpacity onPress={login} style={{ paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, backgroundColor: PRIMARY }}>
                <Text style={{ color: DARK, fontSize: 15, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>Se connecter →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={login} style={{ paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "#ffffff" }}>
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
      <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 24, backgroundColor: "#ffffff" }}>
        <View style={{ backgroundColor: BG_WARM, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", borderRadius: 20, padding: 48, maxWidth: 700, width: "100%", alignItems: "center" }}>
          <Text style={{ fontFamily: fonts.black, fontWeight: fontWeights.black, fontSize: 28, color: DARK, textAlign: "center", marginBottom: 12 }}>
            Prêt à simplifier vos actes juridiques ?
          </Text>
          <Text style={{ color: TEXT_SEC, fontSize: 16, fontFamily: fonts.regular, marginBottom: 28, textAlign: "center" }}>
            59 modèles conformes OHADA, génération instantanée en Word et PDF.
          </Text>
          <TouchableOpacity onPress={login} style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 10, backgroundColor: PRIMARY }}>
            <Text style={{ color: DARK, fontSize: 16, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>Se connecter →</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 16, fontSize: 13, color: "#9ca3af", fontFamily: fonts.regular }}>Connexion sécurisée via NORMX AI</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingVertical: 32, paddingHorizontal: 24, alignItems: "center" }}>
        <Text style={{ fontSize: 13, color: TEXT_SEC, fontFamily: fonts.regular }}>
          © 2026 NORMX AI SAS — 5/7 rue Benjamin Raspail, 60100 Creil, France
        </Text>
      </View>
    </ScrollView>
  );
}
