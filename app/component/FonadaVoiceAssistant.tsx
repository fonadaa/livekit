'use client';

import SimpleVoiceAssistant from './SimpleVoiceAssistant';

// Only initialize the web component on the client side
if (typeof window !== 'undefined') {
  class FonadaVoiceAssistant extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return; // Prevent re-attachment

      const shadow = this.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadow.appendChild(container);

      import("./SimpleVoiceAssistant").then((mod) => {
        const root = document.createElement("div");
        container.appendChild(root);
        import("react-dom/client").then((ReactDOM) => {
          ReactDOM.createRoot(root).render(
            <mod.default onStateChange={() => {}} />
          );
        });
      });
    }
  }

  // Register Web Component (only once)
  if (!customElements.get("fonada-voice-assistant")) {
    customElements.define("fonada-voice-assistant", FonadaVoiceAssistant);
  }
}

export default function FonadaVoiceAssistantWrapper() {
  return null;
} 