import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";

let chosenSpecies = false;
let hash = ""
let queryIndex = ""
let queryParams = ""
let urlParams = ""
let speciesName = ""

CMS.registerEventListener({
  name: 'login',
  handler: () => {
    setTimeout(() => {
      if (!document.querySelector('.CMS_Autocomplete_input')) return;
      hash = window.location.hash;
      queryIndex = hash.indexOf('?');
      queryParams = queryIndex !== -1 ? hash.substring(queryIndex + 1) : '';
      urlParams = new URLSearchParams(queryParams);
      speciesName = urlParams.get('speciesId');
      console.log('species name: ' + speciesName);
      if (speciesName) {
        chosenSpecies = true;
        console.log(chosenSpecies);
      } else {
        chosenSpecies = false;
        console.log(chosenSpecies);
        return;
      }

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
    if (chosenSpecies) {
      const currentValue = speciesName;
      console.log("Species ID changed to:", currentValue);
      
      // You can modify data if needed, or just log as above
      return {
        ...data
        , speciesid: currentValue
      };
    } else {
      return data;
    }
  },
});






  
  
  
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
