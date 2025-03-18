(function() {
    if (window.FonadaVoiceAssistantLoaded) return;
    window.FonadaVoiceAssistantLoaded = true;
  
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      fonada-voice-assistant {
        display: block;
        width: 100%;
        height: 300px;
        border: none;
      }
    `;
    document.head.appendChild(style);
  
    // Load required styles
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonada.vercel.app/styles.css';
    document.head.appendChild(linkElement);
  
    // Initialize the web component
    class FonadaVoiceAssistant extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
  
      connectedCallback() {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://fonada.vercel.app';
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              width: 100%;
              height: 300px;
            }
          </style>
        `;
        this.shadowRoot.appendChild(iframe);
      }
    }
  
    if (!customElements.get('fonada-voice-assistant')) {
      customElements.define('fonada-voice-assistant', FonadaVoiceAssistant);
    }
  })();
  