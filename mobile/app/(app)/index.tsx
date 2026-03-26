import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { useAuthStore } from "@/lib/store/auth";
import { useDocumentsStore } from "@/lib/store/documents";
import { documentsApi, type DocumentItem } from "@/lib/api/documents";
import { useLayoutContext } from "@/components/layout/AppLayout";

// ── Navigation principale (mobile only) ──
const NAV_TABS = [
  { key: "entreprise", label: "Entreprise", icon: "briefcase-outline" as const },
  { key: "travail", label: "Travail", icon: "people-outline" as const },
  { key: "immobilier", label: "Immobilier", icon: "home-outline" as const },
  { key: "famille", label: "Famille", icon: "heart-outline" as const },
];

// ── Contenu par onglet ──
type DocItem = { id: string; label: string; available: boolean };
type Section = { title: string; docs: DocItem[] };

const ROUTES: Record<string, string> = {
  sarl: "/(app)/generate/sarl", sarlu: "/(app)/generate/sarl",
  "sa-ag": "/(app)/generate/sa-ag", "sa-ca": "/(app)/generate/sa-ca",
  "sa-uni": "/(app)/generate/sa-uni", sas: "/(app)/generate/sas",
  sasu: "/(app)/generate/sasu", gie: "/(app)/generate/gie",
  "ste-part": "/(app)/generate/ste-part", drc: "/(app)/generate/drc",
};

const TAB_SECTIONS: Record<string, { popular: DocItem[]; sections: Section[] }> = {
  entreprise: {
    popular: [
      { id: "sarl", label: "Statuts SARL", available: true },
      { id: "sas", label: "Statuts SAS", available: true },
      { id: "drc", label: "DRC", available: true },
      { id: "sa-ag", label: "Statuts SA (AG)", available: true },
    ],
    sections: [
      {
        title: "Creez votre entreprise",
        docs: [
          { id: "sarl", label: "Statuts SARL", available: true },
          { id: "sarlu", label: "Statuts SARLU", available: true },
          { id: "sas", label: "Statuts SAS", available: true },
          { id: "sasu", label: "Statuts SASU", available: true },
          { id: "sa-ag", label: "Statuts SA (AG)", available: true },
          { id: "sa-ca", label: "Statuts SA (CA)", available: true },
          { id: "sa-uni", label: "Statuts SA Uni.", available: true },
          { id: "gie", label: "Convention GIE", available: true },
          { id: "ste-part", label: "Ste en Participation", available: true },
        ],
      },
      {
        title: "Gerez votre entreprise",
        docs: [
          { id: "drc", label: "DRC (art. 73)", available: true },
          { id: "pv-ago", label: "PV d'AGO", available: false },
          { id: "pv-age", label: "PV d'AGE", available: false },
          { id: "cession", label: "Cession de parts", available: false },
          { id: "modif-statuts", label: "Modification de statuts", available: false },
        ],
      },
      {
        title: "Dissolution",
        docs: [
          { id: "pv-dissolution", label: "PV de dissolution", available: false },
          { id: "bilan-liq", label: "Bilan de liquidation", available: false },
        ],
      },
    ],
  },
  travail: {
    popular: [
      { id: "cdi", label: "Contrat CDI", available: false },
      { id: "cdd", label: "Contrat CDD", available: false },
    ],
    sections: [
      {
        title: "Recrutez votre equipe",
        docs: [
          { id: "cdi", label: "Contrat CDI", available: false },
          { id: "cdd", label: "Contrat CDD", available: false },
          { id: "stage", label: "Convention de stage", available: false },
          { id: "promesse", label: "Promesse d'embauche", available: false },
        ],
      },
      {
        title: "Gerez votre equipe",
        docs: [
          { id: "avenant", label: "Avenant au contrat", available: false },
          { id: "attestation", label: "Attestation de travail", available: false },
          { id: "avertissement", label: "Avertissement", available: false },
        ],
      },
      {
        title: "Se separer d'un employe",
        docs: [
          { id: "licenciement", label: "Licenciement", available: false },
          { id: "certificat", label: "Certificat de travail", available: false },
          { id: "solde", label: "Solde de tout compte", available: false },
        ],
      },
    ],
  },
  immobilier: {
    popular: [
      { id: "bail-com", label: "Bail commercial", available: false },
      { id: "sci", label: "Statuts SCI", available: false },
    ],
    sections: [
      {
        title: "Immobilier commercial",
        docs: [
          { id: "bail-com", label: "Bail commercial", available: false },
          { id: "bail-pro", label: "Bail professionnel", available: false },
          { id: "resil-bail", label: "Resiliation de bail", available: false },
        ],
      },
      {
        title: "Patrimoine residentiel",
        docs: [
          { id: "bail-hab", label: "Bail d'habitation", available: false },
          { id: "sci", label: "Statuts SCI", available: false },
          { id: "etat-lieux", label: "Etat des lieux", available: false },
          { id: "quittance", label: "Quittance de loyer", available: false },
        ],
      },
    ],
  },
  famille: {
    popular: [
      { id: "donation", label: "Acte de donation", available: false },
      { id: "testament", label: "Testament", available: false },
    ],
    sections: [
      {
        title: "Succession & Patrimoine",
        docs: [
          { id: "testament", label: "Testament", available: false },
          { id: "donation", label: "Acte de donation", available: false },
          { id: "procuration", label: "Procuration", available: false },
          { id: "dette", label: "Reconnaissance de dette", available: false },
        ],
      },
      {
        title: "Associations",
        docs: [
          { id: "statuts-asso", label: "Statuts d'association", available: false },
          { id: "pv-asso", label: "PV d'AG association", available: false },
        ],
      },
    ],
  },
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const isDesktop = !isMobile && Platform.OS === "web";
  const { user, logout } = useAuthStore();
  const { documents, setDocuments, setLoading } = useDocumentsStore();
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("entreprise");
  const [showMenu, setShowMenu] = useState(false);

  // Access layout context (safe default for mobile)
  let layoutContext: { activeSection: string; setActiveSection: (s: string) => void } | null = null;
  try {
    layoutContext = useLayoutContext();
  } catch {
    // Not within layout context on mobile
  }

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await documentsApi.list();
      setDocuments(data.documents);
    } catch { setError("Impossible de charger les documents"); }
    finally { setLoading(false); }
  };

  const navigateTo = (id: string) => {
    const route = ROUTES[id];
    if (route) { setShowMenu(false); router.navigate(route as any); }
  };

  const content = TAB_SECTIONS[activeTab];

  const renderDocument = ({ item }: { item: DocumentItem }) => (
    <TouchableOpacity style={{
      backgroundColor: "#ffffff", padding: 18,
      borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
      flexDirection: "row", alignItems: "center", gap: 14,
    }}>
      <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: colors.primary + "12", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="document-text" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.text }}>{item.label}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
          {item.forme_juridique} — {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </View>
      {item.docx_url && (
        <View style={{ backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: "#2563eb" }}>DOCX</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Desktop dashboard (sidebar handles navigation) ──
  if (isDesktop) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 960, padding: 32 }}>
        {/* Welcome */}
        <View style={{
          backgroundColor: colors.headerBg, padding: 32, borderRadius: 12, marginBottom: 28,
        }}>
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 26, color: "#ffffff", marginBottom: 6 }}>
            Bonjour, {user?.prenom}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            Generez vos documents juridiques OHADA en quelques clics.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (layoutContext) {
                layoutContext.setActiveSection("entreprise");
              }
            }}
            style={{
              backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24,
              borderRadius: 8, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8,
            }}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: "#ffffff" }}>
              Creer un document
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 28 }}>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="document-text" size={20} color="#D4A843" />
              </View>
              <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 13, color: colors.textSecondary }}>Total documents</Text>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 32, color: colors.text }}>{documents.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="calendar-outline" size={20} color="#22c55e" />
              </View>
              <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 13, color: colors.textSecondary }}>Ce mois</Text>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 32, color: colors.text }}>
              {documents.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 13, color: colors.textSecondary }}>Modeles disponibles</Text>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 32, color: colors.text }}>10</Text>
          </View>
        </View>

        {/* Quick access */}
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 14 }}>
          Acces rapide
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          {[
            { id: "sarl", label: "Statuts SARL", icon: "briefcase-outline" as const },
            { id: "sas", label: "Statuts SAS", icon: "briefcase-outline" as const },
            { id: "sasu", label: "Statuts SASU", icon: "briefcase-outline" as const },
            { id: "sa-ag", label: "Statuts SA (AG)", icon: "briefcase-outline" as const },
            { id: "drc", label: "DRC (art. 73)", icon: "document-text-outline" as const },
            { id: "gie", label: "Convention GIE", icon: "people-outline" as const },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigateTo(item.id)}
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                minWidth: 180,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={item.icon} size={18} color="#D4A843" />
              </View>
              <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 13, color: colors.text }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color="#9ca3af" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent documents */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text }}>
            Mes documents recents
          </Text>
          {documents.length > 0 && (
            <TouchableOpacity onPress={loadDocuments} style={{ padding: 4 }}>
              <Ionicons name="refresh-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <View style={{ backgroundColor: "#fef2f2", padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.danger, marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#991b1b" }}>{error}</Text>
          </View>
        ) : null}

        {documents.length === 0 ? (
          <View style={{ backgroundColor: "#ffffff", padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 8 }}>
              Aucun document
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 360, marginBottom: 24 }}>
              Utilisez le menu lateral pour creer votre premier document juridique conforme OHADA.
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <FlatList data={documents} renderItem={renderDocument} keyExtractor={(item) => item.id} scrollEnabled={false} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // ── Mobile: keep existing behavior with inline header + tabs ──
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header + Logo */}
      <View style={{ backgroundColor: "#ffffff", paddingTop: 50, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: colors.headerBg, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-text" size={18} color="#fff" />
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: colors.headerBg }}>NORMX Legal</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>{user?.prenom} {user?.nom}</Text>
            <TouchableOpacity onPress={logout} style={{ padding: 6 }}>
              <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Onglets navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row" }}>
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => {
                    if (activeTab === tab.key && showMenu) {
                      setShowMenu(false);
                    } else {
                      setActiveTab(tab.key);
                      setShowMenu(true);
                    }
                  }}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 14,
                    borderBottomWidth: 3,
                    borderBottomColor: isActive && showMenu ? colors.primary : "transparent",
                    flexDirection: "row", alignItems: "center", gap: 6,
                  }}
                >
                  <Ionicons name={tab.icon} size={16} color={isActive && showMenu ? colors.primary : colors.textMuted} />
                  <Text style={{
                    fontFamily: isActive && showMenu ? fonts.bold : fonts.medium,
                    fontWeight: isActive && showMenu ? fontWeights.bold : fontWeights.medium,
                    fontSize: 14,
                    color: isActive && showMenu ? colors.headerBg : colors.textSecondary,
                  }}>
                    {tab.label}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color={isActive && showMenu ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Menu deroulant */}
      {showMenu && content && (
        <View style={{ backgroundColor: colors.headerBg, paddingVertical: 20, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
          {/* Services populaires */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 12, color: colors.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Services populaires
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {content.popular.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  disabled={!item.available}
                  onPress={() => navigateTo(item.id)}
                  style={{
                    backgroundColor: item.available ? colors.primary : "rgba(255,255,255,0.1)",
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 5,
                    opacity: item.available ? 1 : 0.4,
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 13, color: "#ffffff" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sections en colonnes */}
          <View style={{ flexDirection: "column", gap: 18 }}>
            {content.sections.map((section, sIdx) => (
              <View key={sIdx} style={{ flex: 1, minWidth: 180 }}>
                <Text style={{
                  fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14,
                  color: colors.primary, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5,
                }}>
                  {section.title}
                </Text>
                {section.docs.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    disabled={!doc.available}
                    onPress={() => navigateTo(doc.id)}
                    style={{ paddingVertical: 7, opacity: doc.available ? 1 : 0.4 }}
                  >
                    <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: "#ffffff" }}>
                      {doc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Fermer */}
          <TouchableOpacity onPress={() => setShowMenu(false)} style={{ alignSelf: "center", marginTop: 16, padding: 6 }}>
            <Ionicons name="chevron-up" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Contenu principal */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 900, alignSelf: "center", width: "100%", padding: 16 }}>
        {/* Hero */}
        <View style={{
          backgroundColor: colors.headerBg, padding: 28, borderRadius: 12, marginBottom: 24,
        }}>
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 24, color: "#ffffff", marginBottom: 6 }}>
            Bonjour, {user?.prenom}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            Trouvez tous les documents juridiques dont vous avez besoin.
          </Text>
          <TouchableOpacity
            onPress={() => { setActiveTab("entreprise"); setShowMenu(true); }}
            style={{
              backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24,
              borderRadius: 8, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8,
            }}
          >
            <Ionicons name="search" size={18} color="#ffffff" />
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: "#ffffff" }}>
              Voir tous les documents disponibles
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 20, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>Total documents</Text>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text }}>{documents.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 20, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>Ce mois</Text>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text }}>
              {documents.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length}
            </Text>
          </View>
        </View>

        {/* Mes documents */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>
            Mes documents
          </Text>
          {documents.length > 0 && (
            <TouchableOpacity onPress={loadDocuments} style={{ padding: 4 }}>
              <Ionicons name="refresh-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <View style={{ backgroundColor: "#fef2f2", padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.danger, marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#991b1b" }}>{error}</Text>
          </View>
        ) : null}

        {documents.length === 0 ? (
          <View style={{ backgroundColor: "#ffffff", padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 }}>
            <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 8 }}>
              Aucun document
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 320, marginBottom: 24 }}>
              Creez votre premier document juridique conforme OHADA en quelques minutes.
            </Text>
            <TouchableOpacity
              onPress={() => { setActiveTab("entreprise"); setShowMenu(true); }}
              style={{ backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: "#ffffff" }}>Creer un document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <FlatList data={documents} renderItem={renderDocument} keyExtractor={(item) => item.id} scrollEnabled={false} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
