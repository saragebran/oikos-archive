import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";


CMS.registerEventListener({
    name: 'mounted',
    handler: () => {
      // Only execute this script if the URL indicates that a new 'representations' entry is being created
      if (window.location.pathname.includes('/representations/new')) {
        // Use setTimeout to ensure the DOM is fully loaded
        setTimeout(() => {
          // Assume the URL contains a parameter like ?speciesid=UUID
          const urlParams = new URLSearchParams(window.location.search);
          const speciesId = urlParams.get('speciesid'); // This should match the query parameter in the URL
          
          // Find the input field for 'speciesid' in the CMS form
          const speciesIdInput = document.querySelector('input[name="speciesid"]');
          
          if (speciesIdInput && speciesId) {
            // Set the value of the speciesid field
            speciesIdInput.value = speciesId;
          }
        }, 500); // Adjust the timeout as needed based on how quickly your CMS typically loads forms
      }
    }
  });
  
  
  
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
