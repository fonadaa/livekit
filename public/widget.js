(function() {
    if (window.FonadaVoiceAssistantLoaded) return;
    window.FonadaVoiceAssistantLoaded = true;
  
    const script = document.createElement("script");
    script.src = "https://fonada.vercel.app/_next/static/chunks/page.js";
    script.type = "module";
    document.head.appendChild(script);
  })();
  