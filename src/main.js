import './style.css'
import axios from 'axios'
import { streamAndPlayText } from './tts.js'
import { marked } from 'marked';

// Get DOM elements
const chatBox = document.getElementById("chatBox")
const submitButton = document.getElementById("submitBtn")
const textArea = document.getElementById("textArea")

// Local Ollama API endpoint
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';

// Function to display chat messages
function chatMessage(text, senderId) {
  const msg = document.createElement("div")
  msg.className = `p-2 flex text-white font-sans font-normal color-white flex-col ${(senderId === 'user') ? `items-end` : `items-start`} `
  msg.innerHTML = `
  <div class="${senderId === 'user' ? 'bg-zinc-900' : ''} h-fit w-6/10 rounded-2xl p-3 font-bold">
    ${senderId === 'bot' ? marked.parse(text) : text}
  </div>
`;
  if (senderId === "bot") {
    const ttsButton = document.createElement("div")
    ttsButton.className = `cursor-pointer transition  transform hover:scale-125 hover:text-blue-600 pl-2 `
    ttsButton.innerText = `🔊`
    ttsButton.addEventListener("click", () => {
      streamAndPlayText(text);
    });
    msg.append(ttsButton)
  }
  chatBox.append(msg)
}

// Send prompt to Gemma model
async function talkToGemma(prompt) {
  console.log('You:', prompt);
  console.log('Gemma is thinking...');
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: 'gemma3:1b',
      prompt: `You are a helpful AI assistant.
You must follow these rules:
- Always answer directly in **valid Markdown** (no explanations about formatting).
- Never repeat the same answer twice.
- Never write phrases like "Here is the answer in Markdown" or "Valid Markdown".
- Keep answers short, clear, and concise.
- Use bullet points for lists, headings where appropriate, and code blocks for code.

User: ${prompt}`,
      stream: false
    });

    if (response.status !== 200) {
      throw new Error('Response not fetched')
    }
    return response.data.response.trim()

  } catch (error) {
    console.error('Error communicating with Gemma:', error);
    return "Error talking to Gemma."
  }
}

// Handle submit button click
submitButton.addEventListener('click', async () => {
  let prompt = textArea.value

  if (prompt != ``) {
    textArea.value = ``
    try {
      chatMessage(prompt, "user")
      let gemmaResponse = await talkToGemma(prompt)
      chatMessage(gemmaResponse, "bot")
    } catch (error) {
      chatMessage("Error Happened", "bot")
    }
  }
})

// Handle Enter key for submit
textArea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitButton.click();
  }
});

// Initial bot message
(() => { chatMessage("Hi there, gemma3:1b this side, How can I help?", "bot"); })();
