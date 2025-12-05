const WakeRecognition = new webkitSpeechRecognition();
WakeRecognition.continuous = true;
WakeRecognition.lang = "en-US";

WakeRecognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript.toLowerCase();

    if (text.includes("hey charlie") || text.includes("hi charlie")) {
        document.getElementById("assistant-window").classList.remove("hidden");
        speechSynthesis.speak(new SpeechSynthesisUtterance("Hello, how can I help you?"));
    }
if (text.includes("open youtube") || text.includes("open youtube")) {
        document.getElementById("assistant-window").classList.remove("hidden");
        speechSynthesis.speak(new SpeechSynthesisUtterance("Openning"));
    }

};


WakeRecognition.start();

