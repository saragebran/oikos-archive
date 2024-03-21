import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";

 CMS.registerEventListener({
    name: 'login',
    handler: ({ author: { login, name } }) => {
      const hashSegments = window.location.hash.split('/');
      const sciname = hashSegments[4];
      if (sciname) {
        setTimeout(() => {
            function simulateKeyPress(element, key) {
                // Create and dispatch the keydown event
                const keydownEvent = new KeyboardEvent('keydown', { key: key, bubbles: true, cancelable: true });
                element.dispatchEvent(keydownEvent);
            
                // Create and dispatch the keyup event
                const keyupEvent = new KeyboardEvent('keyup', { key: key, bubbles: true, cancelable: true });
                element.dispatchEvent(keyupEvent);
            }
            function simulateTyping(inputField, text, callback) {
                inputField.focus();  // Focus the field to start
              
                text.split('').forEach((char, index) => {
                  setTimeout(() => {
                    // Create and dispatch a keydown event
                    const keydownEvent = new KeyboardEvent('keydown', { key: char, bubbles: true, cancelable: true });
                    inputField.dispatchEvent(keydownEvent);
              
                    // Change the value and dispatch an input event
                    inputField.value += char;
                    const inputEvent = new Event('input', { bubbles: true });
                    inputField.dispatchEvent(inputEvent);
              
                    // Create and dispatch a keyup event
                    const keyupEvent = new KeyboardEvent('keyup', { key: char, bubbles: true, cancelable: true });
                    inputField.dispatchEvent(keyupEvent);
              
                    // If the last character is typed, execute the callback
                    if (index === text.length - 1) {
                      setTimeout(callback, 500); // Adjust delay as necessary to allow suggestions to appear
                      // Simulate pressing the arrow down key
                      simulateKeyPress(inputField, 'ArrowDown');
                                          
                      // Simulate pressing the 'Enter' key
                      simulateKeyPress(inputField, 'Enter');
                    }
                  }, index * 100); // Delay to simulate typing speed
                });
              }
              const inputField = document.getElementById(':r2:');
              simulateTyping(inputField, sciname, () => {
                // Callback function to execute after typing is complete
                console.log('Typing complete');
                const button = document.querySelector('button[data-testid="choose-upload"]');
                if (button) {
                  button.focus();
                }            
              }); 
        }, 2000); // Adjust the timeout duration based on how long it takes for the options to appear
      }
    },
  }); 
  
  
  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.init();
