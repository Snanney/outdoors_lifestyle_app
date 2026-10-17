import { useEffect, useRef, useState } from "react";
import { getReply, SUGGESTIONS, WELCOME_MESSAGE } from "./chatEngine";
import type { Spot } from "../lib";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  spotIds?: string[];
}

interface Props {
  spots: Spot[];
  onSelectSpot: (id: string) => void;
}

let messageId = 0;
const nextId = () => ++messageId;

export function ChatWidget({ spots, onSelectSpot }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), from: "bot", text: WELCOME_MESSAGE },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const spotById = (id: string) => spots.find((s) => s.id === id);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: nextId(), from: "user", text: trimmed };
    const reply = getReply(trimmed, { spots });
    const botMsg: ChatMessage = {
      id: nextId(),
      from: "bot",
      text: reply.text,
      spotIds: reply.spotIds,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        aria-label={open ? "Close chat" : "Open trail guide chat"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "\u2715" : "\u{1F4AC}"}
      </button>

      {open && (
        <section className="chat" aria-label="Trail guide chat">
          <header className="chat__header">
            <span className="chat__title">Trail Guide</span>
            <span className="chat__badge">offline</span>
          </header>

          <div className="chat__messages" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`msg msg--${m.from}`}>
                <div className="msg__bubble">{m.text}</div>
                {m.spotIds && m.spotIds.length > 0 && (
                  <div className="msg__chips">
                    {m.spotIds.map((id) => {
                      const spot = spotById(id);
                      if (!spot) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          className="chip"
                          onClick={() => {
                            onSelectSpot(id);
                            setOpen(false);
                          }}
                        >
                          {spot.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat__suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="chip chip--suggest"
                onClick={() => send(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <form className="chat__input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              placeholder="Ask about Utah trails..."
              onChange={(e) => setInput(e.target.value)}
              aria-label="Message the trail guide"
            />
            <button type="submit" aria-label="Send">
              {"\u27A4"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
