import React, { useState, createContext, useContext } from "react";
import { View, Platform } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { Sidebar2 } from "./Sidebar2";

// ── Context for sidebar state (so index.tsx can read it) ──
type LayoutContextType = {
  activeSection: string;
  setActiveSection: (s: string) => void;
  sidebar2Section: string | null;
  setSidebar2Section: (s: string | null) => void;
  activeSubItem: string | null;
  setActiveSubItem: (s: string | null) => void;
};

const LayoutContext = createContext<LayoutContextType>({
  activeSection: "accueil",
  setActiveSection: () => {},
  sidebar2Section: null,
  setSidebar2Section: () => {},
  activeSubItem: null,
  setActiveSubItem: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isMobile } = useResponsive();
  const isDesktop = !isMobile && Platform.OS === "web";

  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("accueil");
  const [sidebar2Section, setSidebar2Section] = useState<string | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  const handleSectionPress = (key: string) => {
    setActiveSection(key);

    // Sections with sub-items toggle sidebar 2
    const sectionsWithSub = ["entreprise", "travail", "immobilier", "famille"];
    if (sectionsWithSub.includes(key)) {
      if (sidebar2Section === key) {
        setSidebar2Section(null);
      } else {
        setSidebar2Section(key);
      }
    } else {
      setSidebar2Section(null);
      // Navigate based on section
      if (key === "accueil") {
        router.navigate("/(app)");
      } else if (key === "documents") {
        router.navigate("/(app)");
      }
    }
  };

  const contextValue: LayoutContextType = {
    activeSection,
    setActiveSection,
    sidebar2Section,
    setSidebar2Section,
    activeSubItem,
    setActiveSubItem,
  };

  // ── Mobile: just topbar + content ──
  if (!isDesktop) {
    return (
      <LayoutContext.Provider value={contextValue}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </LayoutContext.Provider>
    );
  }

  // ── Desktop: topbar + sidebar + sidebar2 + content ──
  return (
    <LayoutContext.Provider value={contextValue}>
      <View style={{ height: "100vh" as any, width: "100vw" as any, overflow: "hidden" }}>
        {/* Topbar */}
        <Topbar />

        {/* Below topbar */}
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* Sidebar 1 */}
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            activeSection={activeSection}
            onSectionPress={handleSectionPress}
          />

          {/* Sidebar 2 (conditional) */}
          {sidebar2Section && (
            <Sidebar2
              section={sidebar2Section}
              activeItem={activeSubItem}
              onItemPress={(id) => setActiveSubItem(id)}
              onClose={() => setSidebar2Section(null)}
            />
          )}

          {/* Main content — occupe tout l'espace restant */}
          <View style={{ flex: 1, backgroundColor: "#f3f4f6", overflow: "auto" as any }}>
            {children}
          </View>
        </View>
      </View>
    </LayoutContext.Provider>
  );
}
