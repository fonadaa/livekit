(function() {
    if (window.FonadaVoiceAssistantLoaded) return;
    window.FonadaVoiceAssistantLoaded = true;
  
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      fonada-voice-assistant {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 500px;
        z-index: 999999;
        display: block;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        background: transparent;
      }

      @media (max-width: 480px) {
        fonada-voice-assistant {
          width: 90vw;
          height: 400px;
          bottom: 10px;
          right: 5%;
        }
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
        
        // Style the iframe
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              width: 100%;
              height: 100%;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              border-radius: 12px;
              background: transparent;
            }
          </style>
        `;
        this.shadowRoot.appendChild(iframe);

        // Add minimize/maximize functionality (optional)
        const minimizeButton = document.createElement('button');
        minimizeButton.innerHTML = '−';
        minimizeButton.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          z-index: 1000000;
        `;
        this.shadowRoot.appendChild(minimizeButton);
      }
    }
  
    if (!customElements.get('fonada-voice-assistant')) {
      customElements.define('fonada-voice-assistant', FonadaVoiceAssistant);
    }
  })();
  