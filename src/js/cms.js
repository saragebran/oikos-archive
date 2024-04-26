import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";

CMS.registerEventListener({
  name: 'login',
  handler: () => {
    setTimeout(() => {
      if (!document.querySelector('.CMS_Autocomplete_input')) return;
      const speciesInput = document.querySelector('.CMS_Autocomplete_input');
      speciesInput.focus();
      // Clear existing value and trigger update
      speciesInput.value = '';
      speciesInput.dispatchEvent(new Event('input', { bubbles: true })); // Reset the component's internal state
      speciesInput.dispatchEvent(new Event('change', { bubbles: true }));

      setTimeout(() => {
        speciesInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
        setTimeout(() => {
          speciesInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
        }, 500); // Short delay before pressing 'Enter'

      }, 500); // Ensure all typing completes before navigating
    }, 2000);
  }
});

CMS.registerEventListener({
  name: 'change',
  collection: 'representations',
  field: 'speciesid',
  handler: ({ data, collection, field }) => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    const queryParams = queryIndex !== -1 ? hash.substring(queryIndex + 1) : '';
    const urlParams = new URLSearchParams(queryParams);
    const speciesName = urlParams.get('speciesId');
    const currentValue = speciesName;
    console.log("Species ID changed to:", currentValue);
    
    // You can modify data if needed, or just log as above
    return {
      ...data
      , speciesid: currentValue
    };
  },
});






  
  
  
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
