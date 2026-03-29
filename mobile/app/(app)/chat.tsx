import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";
import {
  sendChatMessage,
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  type ChatMessage,
  type Conversation,
  type ChatSource,
} from "@/lib/api/chat";

export default function ChatScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Charger la liste des conversations au mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch {
      // Silently fail if not authenticated
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const conv = await getConversation(id);
      setConversationId(conv.id);
      setMessages(conv.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      setShowHistory(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Handle error silently
    }
  };

  const startNewConversation = async () => {
    try {
      const conv = await createConversation();
      setConversationId(conv.id);
      setMessages([]);
      setSources([]);
      setShowHistory(false);
      await loadConversations();
    } catch {
      // Handle error silently
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
      await loadConversations();
    } catch {
      // Handle error silently
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Créer une conversation si aucune n'est active
    let activeConvId = conversationId;
    if (!activeConvId) {
      try {
        const conv = await createConversation();
        activeConvId = conv.id;
        setConversationId(conv.id);
      } catch {
        // Continue without persistence
      }
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setSources([]);
    setShowSources(false);

    try {
      const result = await sendChatMessage(newMessages, {
        conversationId: activeConvId || undefined,
      });
      setMessages([...newMessages, { role: "assistant", content: result.response }]);
      setSources(result.sources || []);
      // Rafraîchir la liste des conversations (le titre a peut-être changé)
      await loadConversations();
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Désolé, une erreur est survenue. Vérifiez que le serveur est démarré et que les clés API sont configurées." },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, isLoading, conversationId]);

  const suggestions = [
    "Quel est le capital minimum pour créer une SARL ?",
    "Quelles sont les différences entre SNC et SCS ?",
    "Comment dissoudre une SA ?",
    "Quels documents pour une cession de parts SARL ?",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.headerBg, paddingTop: isMobile ? 50 : 0, paddingBottom: 16, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(212,168,67,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chatbubbles" size={20} color="#D4A843" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: "#fff" }}>
                Assistant OHADA
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }} numberOfLines={1}>
                {conversationId ? conversations.find((c) => c.id === conversationId)?.title || "Conversation" : "Nouvelle conversation"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={{ padding: 8 }}>
              <Ionicons name="time-outline" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={startNewConversation} style={{ padding: 8 }}>
              <Ionicons name="add-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Historique des conversations */}
      {showHistory && (
        <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 300 }}>
          <ScrollView>
            {conversations.length === 0 ? (
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, padding: 16, textAlign: "center" }}>
                Aucune conversation
              </Text>
            ) : (
              conversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => loadConversation(conv.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: conv.id === conversationId ? colors.sidebarActive : colors.card,
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={conv.id === conversationId ? colors.headerBg : colors.textMuted} style={{ marginRight: 12 }} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1 }} numberOfLines={1}>
                    {conv.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteConversation(conv.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

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
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#D4A843" />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1 }}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
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
                backgroundColor: msg.role === "user" ? colors.headerBg : colors.card,
                borderRadius: 12,
                padding: 14,
                borderWidth: msg.role === "assistant" ? 1 : 0,
                borderColor: colors.border,
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

        {/* Sources RAG */}
        {!isLoading && sources.length > 0 && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
          <View style={{ marginTop: 4, marginBottom: 12, paddingLeft: 8 }}>
            <TouchableOpacity
              onPress={() => setShowSources(!showSources)}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 }}
            >
              <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                {sources.length} source{sources.length > 1 ? "s" : ""} consultée{sources.length > 1 ? "s" : ""}
              </Text>
              <Ionicons name={showSources ? "chevron-up" : "chevron-down"} size={12} color={colors.textMuted} />
            </TouchableOpacity>
            {showSources && (
              <View style={{ gap: 6, marginTop: 4 }}>
                {sources.map((src, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <Ionicons name="bookmark-outline" size={14} color="#D4A843" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text }} numberOfLines={2}>
                        {src.titre}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {src.chapitre} {src.paragraphe ? `- §${src.paragraphe}` : ""} {src.forme_juridique && src.forme_juridique !== "TOUTES" ? `(${src.forme_juridique})` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
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
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={handleSend}
            style={{
              flex: 1,
              backgroundColor: colors.input,
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
              backgroundColor: input.trim() ? colors.primary : colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="send" size={18} color={input.trim() ? "#fff" : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
