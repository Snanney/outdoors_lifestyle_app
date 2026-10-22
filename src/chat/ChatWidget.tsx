import { useEffect, useRef, useState } from "react";
import { getReply, SUGGESTIONS, WELCOME_MESSAGE } from "./chatEngine";
import { Icon, type Spot } from "../lib";

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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), from: "bot", text: WELCOME_MESSAGE },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const spotById = (id: string) => spots.find((s) => s.id === id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <section className="chat chat--page" aria-label="Trail guide">
      <header className="chat__header">
        <h1 className="chat__title">Guide</h1>
        <p className="chat__subtitle">Offline trail questions</p>
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
                      onClick={() => onSelectSpot(id)}
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
          placeholder="Ask about Utah trails"
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message the trail guide"
        />
        <button type="submit" aria-label="Send">
          <Icon name="send" size={18} />
        </button>
      </form>
    </section>
  );
}
