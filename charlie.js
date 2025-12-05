// DOM elements
const chatBubble = document.getElementById("chat-bubble");
const assistantWindow = document.getElementById("assistant-window");
const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const stopBtn = document.getElementById("stopBtn");
const avatarFace = document.getElementById("avatar-face");
const avatarMouth = document.getElementById("avatar-mouth");

// Avatar emotions
const emotions = {
  neutral: "avatar/neutral.png",
  happy: "avatar/happy.png",
  sad: "avatar/sad.png",
  angry: "avatar/angry.png",
  excited: "avatar/excited.png"
};

// Chat toggle
chatBubble.onclick = () => assistantWindow.classList.toggle("hidden");

// Add message to chat
function addMessage(sender, text){
  const p = document.createElement("p");
  p.innerHTML = `<b>${sender}:</b> ${text}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Detect emotion from AI reply (simple keyword-based)
function detectEmotion(text){
  text = text.toLowerCase();
  if(text.includes("happy") || text.includes("great") || text.includes("awesome")) return "happy";
  if(text.includes("sorry") || text.includes("sad")) return "sad";
  if(text.includes("angry") || text.includes("mad")) return "angry";
  if(text.includes("excited") || text.includes("let's go")) return "excited";
  return "neutral";
}

// Avatar mouth animation
let speakingInterval;
function animateMouth(start){
  if(start){
    speakingInterval = setInterval(()=>{
      avatarMouth.style.opacity = avatarMouth.style.opacity == 1 ? 0 : 1;
    }, 150);
  }else{
    clearInterval(speakingInterval);
    avatarMouth.style.opacity = 0;
  }
}

// Speech synthesis
function speak(text){
  const emotion = detectEmotion(text);
  avatarFace.src = emotions[emotion];
  animateMouth(true);

  const utter = new SpeechSynthesisUtterance(text);
  utter.onend = ()=>animateMouth(false);
  speechSynthesis.speak(utter);
}

// OpenAI API key (replace 'YOUR_OPENAI_API_KEY' with your real key securely)
const OPENAI_API_KEY = "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";

// Send AI request using OpenAI Chat API
async function askAI(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // or "gpt-4" if available for you
        messages: [
          { role: "system", content: "You are a helpful assistant named Charlie." },
          { role: "user", content: text }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return "Sorry, I couldn't process your request.";
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("Fetch error:", error);
    return "Sorry, there was an error.";
  }
}

// Send message button click handler
sendBtn.onclick = async () => {
  const text = userInput.value.trim();
  if(!text) return;
  addMessage("You", text);
  userInput.value = "";
  const reply = await askAI(text);
  addMessage("Charlie", reply);
  speak(reply);
};

// Voice recognition
let recognition;
function startListening(){
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = async (event)=>{
    const text = event.results[event.results.length-1][0].transcript;
    addMessage("You", text);
    const reply = await askAI(text);
    addMessage("Charlie", reply);
    speak(reply);
  };

  recognition.onerror = (e)=>console.log("Error:", e);
  recognition.onend = ()=>recognition.start(); // auto-restart
  recognition.start();
}

// Microphone button
micBtn.onclick = ()=>startListening();
stopBtn.onclick = ()=>recognition && recognition.stop();

// Wake word listener (Hey Charlie)
function wakeWordListener(){
  const wakeRec = new webkitSpeechRecognition();
  wakeRec.continuous = true;
  wakeRec.lang = "en-US";
  wakeRec.interimResults = false;

  wakeRec.onresult = (event)=>{
    const text = event.results[event.results.length-1][0].transcript.toLowerCase();
    if(text.includes("hey charlie")){
      assistantWindow.classList.remove("hidden");
      speak("Hello, how can I help you?");
      startListening();
    }
  };
  wakeRec.start();
}

wakeWordListener();
