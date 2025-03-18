(function() {
    if (window.FonadaVoiceAssistantLoaded) return;
    window.FonadaVoiceAssistantLoaded = true;
  
    // Import the component only on the client side
    const script = document.createElement("script");
    script.src = "https://fonada.vercel.app/_next/static/chunks/pages/component/FonadaVoiceAssistant.js";
    script.type = "module";
    document.head.appendChild(script);
  })();
  