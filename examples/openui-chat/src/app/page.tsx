"use client";
import "@openuidev/react-ui/components.css";

import { openAIAdapter, openAIMessageFormat } from "@openuidev/react-headless";
import { FullScreen } from "@openuidev/react-ui";
import { openuiChatLibrary } from "@openuidev/react-ui/genui-lib";
import { useEffect, useRef, useState } from "react";

const btnStyle = (dark: boolean) => ({
  fontSize: 13,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid rgba(128,128,128,0.3)",
  background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  color: dark ? "#fff" : "#333",
  cursor: "pointer" as const,
  backdropFilter: "blur(8px)",
});

export default function Page() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const modelRef = useRef(selectedModel);
  modelRef.current = selectedModel;

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        const list: string[] = data.models ?? [];
        setModels(list);
        if (list.length > 0 && !selectedModel) {
          const defaultModel = list.find((m: string) => m.includes("9B")) ?? list[0];
          setSelectedModel(defaultModel);
        }
      })
      .catch(() => {});
  }, []);

  const dark = mode === "dark";

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <nav
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 50,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {models.length > 0 && (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              ...btnStyle(dark),
              maxWidth: 260,
              appearance: "auto" as const,
            }}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
          style={btnStyle(dark)}
        >
          {mode === "light" ? "Dark" : "Light"}
        </button>
      </nav>
      <FullScreen
        processMessage={async ({ messages, abortController }) => {
          return fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: openAIMessageFormat.toApi(messages),
              model: modelRef.current,
            }),
            signal: abortController.signal,
          });
        }}
        streamProtocol={openAIAdapter()}
        componentLibrary={openuiChatLibrary}
        agentName="OpenUI Chat"
        theme={{ mode }}
        conversationStarters={{
          variant: "short",
          options: [
            { displayText: "Weather in Tokyo", prompt: "What's the weather like in Tokyo right now?" },
            { displayText: "AAPL stock price", prompt: "What's the current Apple stock price?" },
            { displayText: "Contact form", prompt: "Build me a contact form with name, email, topic, and message fields." },
            { displayText: "Data table", prompt: "Show me a table of the top 5 programming languages by popularity with year created." },
          ],
        }}
      />
    </div>
  );
}
