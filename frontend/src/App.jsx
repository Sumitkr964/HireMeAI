
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  Menu,
  Sparkles,
  ArrowUp,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  UserRound,
  Trash2,
  X,
  LoaderCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const suggestions = [
  {
    icon: Code2,
    title: "Technical skills",
    prompt: "What are my technical skills?",
  },
  {
    icon: BriefcaseBusiness,
    title: "Work experience",
    prompt: "Tell me about my work experience.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    prompt: "What are my educational qualifications?",
  },
  {
    icon: Sparkles,
    title: "Why hire me?",
    prompt: "Why should a company hire me?",
  },
];

function createChat() {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
  };
}

// Read the plain-text streaming response from FastAPI.
async function askBackend(question, onChunk) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Backend error ${response.status}: ${details.slice(0, 250)}`
    );
  }

  if (!response.body) {
    throw new Error("Streaming response body is unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let answer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      answer += decoder.decode(value, { stream: true });

      if (answer) {
        onChunk(answer);
      }
    }

    // Flush any remaining bytes from the decoder.
    answer += decoder.decode();

    onChunk(answer);
    return answer;
  } finally {
    reader.releaseLock();
  }
}

export default function App() {
  const [chats, setChats] = useState([createChat()]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const requestId = useRef(0);

  const activeChat =
    chats.find((chat) => chat.id === activeId) || chats[0];

  useEffect(() => {
    if (!activeId && chats[0]) {
      setActiveId(chats[0].id);
    }
  }, [activeId, chats]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hiremeai-chats");
      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setChats(parsed);
        setActiveId(parsed[0].id);
      }
    } catch {
      // Ignore invalid or unavailable local chat history.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hiremeai-chats", JSON.stringify(chats));
    } catch {
      // The chat remains usable if browser storage is unavailable.
    }
  }, [chats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  function updateChat(chatId, update) {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId ? update(chat) : chat
      )
    );
  }

  function newChat() {
    if (loading) return;

    const chat = createChat();
    setChats((previous) => [chat, ...previous]);
    setActiveId(chat.id);
    setInput("");
    setError("");
  }

  function deleteChat(id) {
    if (loading) return;

    const remaining = chats.filter((chat) => chat.id !== id);
    const next = remaining.length ? remaining : [createChat()];

    setChats(next);

    if (activeId === id) {
      setActiveId(next[0].id);
    }

    setError("");
  }

  async function sendMessage(text = input) {
    const question = text.trim();

    if (!question || loading || !activeChat) return;

    const chatId = activeChat.id;
    const currentRequest = ++requestId.current;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const assistantId = crypto.randomUUID();

    updateChat(chatId, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? question.slice(0, 35) +
            (question.length > 35 ? "…" : "")
          : chat.title,
      messages: [
        ...chat.messages,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ],
    }));

    setInput("");
    setError("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await askBackend(question, (partialAnswer) => {
        if (requestId.current !== currentRequest) return;

        updateChat(chatId, (chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === assistantId
              ? { ...message, content: partialAnswer }
              : message
          ),
        }));
      });
    } catch (err) {
      if (requestId.current === currentRequest) {
        setError(
          err.message || "Unable to connect to HireMeAI backend."
        );

        updateChat(chatId, (chat) => ({
          ...chat,
          messages: chat.messages.filter(
            (message) => message.id !== assistantId
          ),
        }));
      }
    } finally {
      if (requestId.current === currentRequest) {
        setLoading(false);
      }
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const assistantHasStarted =
    activeChat?.messages.some(
      (message) =>
        message.role === "assistant" &&
        message.content.length > 0
    ) ?? false;

  return (
    <div className="hireme-app">
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">
                <BriefcaseBusiness size={21} />
              </div>
              <span>HireMeAI</span>
            </div>

            <button
              className="icon-btn"
              title="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose size={19} />
            </button>
          </div>

          <button
            className="new-chat-btn"
            onClick={newChat}
            disabled={loading}
          >
            <Plus size={18} />
            <span>New chat</span>
          </button>

          <div className="history-label">RECENT CHATS</div>

          <div className="history-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`history-item ${
                  activeId === chat.id ? "selected" : ""
                }`}
              >
                <button
                  className="history-select"
                  onClick={() => {
                    setActiveId(chat.id);
                    setError("");
                  }}
                >
                  <MessageSquare size={16} />
                  <span>{chat.title}</span>
                </button>

                <button
                  className="delete-btn"
                  title="Delete chat"
                  aria-label="Delete chat"
                  onClick={() => deleteChat(chat.id)}
                  disabled={loading}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              <UserRound size={19} />
            </div>
            <div className="profile-text">
              <strong>HireMeAI Assistant</strong>
              <span>Resume-powered AI</span>
            </div>
          </div>
        </aside>
      )}

      <main className="chat-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn"
              title="Toggle sidebar"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <Menu size={20} />
            </button>

            <span className="topbar-name">HireMeAI</span>

            <span className="ai-badge">
              <Sparkles size={12} /> Resume AI
            </span>
          </div>

          <div className="topbar-right">
            <span className="status-dot" />
            <span>AI Assistant</span>
          </div>
        </header>

        <section className="chat-scroll">
          {activeChat?.messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-logo">
                <Sparkles size={29} />
              </div>

              <span className="eyebrow">
                YOUR PERSONAL RESUME ASSISTANT
              </span>

              <h1>
                Hi there! 👋
                <br />
                <span>What would you like to know about me?</span>
              </h1>

              <p className="welcome-description">
                Ask me about my skills, experience, projects, and
                qualifications. Everything starts with your resume.
              </p>

              <div className="suggestions">
                {suggestions.map(({ icon: Icon, title, prompt }) => (
                  <button
                    className="suggestion-card"
                    key={title}
                    disabled={loading}
                    onClick={() => sendMessage(prompt)}
                  >
                    <div className="suggestion-icon">
                      <Icon size={20} />
                    </div>
                    <strong>{title}</strong>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {activeChat.messages.map((message) => (
                <article
                  key={message.id}
                  className={`message ${message.role}`}
                >
                  <div className={`message-avatar ${message.role}`}>
                    {message.role === "assistant" ? (
                      <Sparkles size={17} />
                    ) : (
                      <UserRound size={17} />
                    )}
                  </div>

                  <div className="message-body">
                    <strong className="message-author">
                      {message.role === "assistant"
                        ? "HireMeAI"
                        : "You"}
                    </strong>

                    {message.role === "assistant" ? (
                      <div className="markdown-body">
                        {message.content ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        ) : loading ? (
                          <div className="typing">
                            <LoaderCircle
                              size={16}
                              className="spin"
                            />
                            Thinking...
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="user-bubble">
                        {message.content}
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {/* {loading && assistantHasStarted && (
                <div className="streaming-indicator">
                  <LoaderCircle size={14} className="spin" />
                  <span>Generating answer...</span>
                </div>
              )} */}

              <div ref={bottomRef} />
            </div>
          )}
        </section>

        <footer className="composer-area">
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button
                className="icon-btn"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="Message HireMeAI..."
              aria-label="Message HireMeAI"
              disabled={loading}
              onChange={(event) => {
                setInput(event.target.value);
                event.target.style.height = "auto";
                event.target.style.height =
                  Math.min(event.target.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKeyDown}
            />

            <div className="composer-footer">
              <span>
                <Sparkles size={13} />
                Powered by your resume data
              </span>

              <button
                className="send-btn"
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || loading}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </form>

          <p className="disclaimer">
            HireMeAI may make mistakes. Verify important information.
          </p>
        </footer>
      </main>
    </div>
  );
}
