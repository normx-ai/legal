import React, { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { sendChatMessage, type ChatMessage } from "@/lib/api/chat";

export default function ChatScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{ paragraphe: string; chapitre: string; titre: string }[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setSources([]);

    try {
      const result = await sendChatMessage(newMessages);
      setMessages([...newMessages, { role: "assistant", content: result.response }]);
      setSources(result.sources || []);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Désolé, une erreur est survenue. Vérifiez que le serveur est démarré et que les clés API sont configurées." },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, isLoading]);

  const suggestions = [
    "Quel est le capital minimum pour créer une SARL ?",
    "Quelles sont les différences entre SNC et SCS ?",
    "Comment dissoudre une SA ?",
    "Quels documents pour une cession de parts SARL ?",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.headerBg, paddingTop: isMobile ? 50 : 0, paddingBottom: 16, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(212,168,67,0.2)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chatbubbles" size={20} color="#D4A843" />
          </View>
          <View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: "#fff" }}>
              Assistant OHADA
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Posez vos questions sur le droit des sociétés
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isMobile ? 16 : 24, paddingBottom: 100, maxWidth: 800, alignSelf: "center", width: "100%" }}
      >
        {messages.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="book" size={32} color="#D4A843" />
            </View>
            <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginBottom: 8, textAlign: "center" }}>
              Assistant Juridique OHADA
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 24, maxWidth: 400 }}>
              Je connais le droit des sociétés commerciales et du GIE OHADA. Posez-moi vos questions !
            </Text>

            <View style={{ gap: 8, width: "100%" }}>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setInput(s); }}
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 8,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#D4A843" />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1 }}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                maxWidth: "80%",
                backgroundColor: msg.role === "user" ? colors.headerBg : "#fff",
                borderRadius: 12,
                padding: 14,
                borderWidth: msg.role === "assistant" ? 1 : 0,
                borderColor: "#e5e7eb",
                ...(Platform.OS === "web" && msg.role === "assistant" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : {}),
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: msg.role === "user" ? "#fff" : colors.text,
                  lineHeight: 22,
                }}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}>
            <ActivityIndicator size="small" color="#D4A843" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>Recherche en cours...</Text>
          </View>
        )}

        {/* Sources masquées - réponse naturelle uniquement */}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          backgroundColor: "#fff",
          padding: 12,
          paddingBottom: isMobile ? 28 : 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            maxWidth: 800,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Posez votre question sur le droit OHADA..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleSend}
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontFamily: fonts.regular,
              fontSize: 14,
              color: colors.text,
              ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() ? "#D4A843" : "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="send" size={18} color={input.trim() ? "#fff" : "#9ca3af"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
