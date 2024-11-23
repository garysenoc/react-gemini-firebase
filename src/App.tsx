import { useEffect, useState, useRef } from "react";
import "./App.css";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { app } from "./firebase";

interface Message {
  type: "user" | "chatgpt";
  text: string;
}

function App() {
  const vertexAI = getVertexAI(app);
  const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-pro" });

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const generatePrompt = async (prompt: string): Promise<string> => {
    setLoading(true);
    const result = await model.generateContent(prompt);
    setLoading(false);
    return result.response.text();
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (userInput.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "user", text: userInput },
      ]);
      setUserInput("");
      const text = await generatePrompt(userInput);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "chatgpt", text },
      ]);
    }
  };

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='app-container'>
      <div className='chat-container'>
        <div className='chat-header'>
          <h1>ChatGPT</h1>
        </div>
        <div className='chat-messages'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type}`}
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: message.text.replace(/\*([^*]+)\*/g, "<b>$1</b>"),
                }}
              />
            </div>
          ))}
          <div ref={messageEndRef} />
          {loading && (
            <div className="loading-indicator">Loading...</div>
          )}
        </div>
        <div className='chat-input'>
          <input
            type='text'
            placeholder='Type your message here...'
            value={userInput}
            onChange={handleUserInput}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
