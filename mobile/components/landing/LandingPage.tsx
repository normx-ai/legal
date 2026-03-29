import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";
import { useResponsive } from "@/lib/hooks/useResponsive";

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>

      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 64, paddingHorizontal: 24, maxWidth: 1200, width: "100%", alignSelf: "center", borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)", backgroundColor: "rgba(255,255,255,0.92)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: fonts.black, fontWeight: fontWeights.black, fontSize: 16, color: DARK }}>N</Text>
          </View>
          <Text style={{ fontSize: 22, fontFamily: fonts.bold, fontWeight: fontWeights.bold, color: DARK }}>
            NORMX <Text style={{ color: PRIMARY }}>Legal</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={login} style={{ paddingVertical: 9, paddingHorizontal: 22, borderRadius: 8, backgroundColor: DARK }}>
          <Text style={{ color: "#ffffff", fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14 }}>Connexion</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={{ paddingTop: isMobile ? 60 : 100, paddingBottom: 60, paddingHorizontal: 24, backgroundColor: BG_WARM }}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: isMobile ? 40 : 60 }}>

          {/* MacBook screenshot — gauche */}
          {!isMobile && (
            <View style={{ flex: 1, maxWidth: 520 }}>
              <View style={{ backgroundColor: "#222", borderRadius: 12, padding: 4, paddingBottom: 0, borderWidth: 2, borderColor: "#333" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#444", alignSelf: "center", marginBottom: 3 }} />
                <Image source={require("@/assets/hero_legal.png")} style={{ width: "100%", aspectRatio: 1.6, borderRadius: 2 }} resizeMode="cover" />
              </View>
              <View style={{ height: 12, backgroundColor: "#c8c8c8", borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                <View style={{ width: 80, height: 4, backgroundColor: "#9a9a9a", borderBottomLeftRadius: 4, borderBottomRightRadius: 4, alignSelf: "center" }} />
              </View>
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
