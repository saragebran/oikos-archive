import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";

CMS.registerEventListener({
    name: 'mounted',
    handler: () => {
      const pathSegments = window.location.pathname.split('/');
      const newSegmentIndex = pathSegments.indexOf('new');
      
      // Check if there is a segment after "new/"
      if (newSegmentIndex >= 0 && pathSegments.length > newSegmentIndex + 1) {
        const uuid = pathSegments[newSegmentIndex + 1]; // Get the UUID from the URL
        
        // Now, find the input field for speciesid and populate it with the UUID
        const inputField = document.querySelector('[name="fields[speciesid]"]');
        if (inputField) {
          inputField.value = uuid;
        }
      }
    },
  });
  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("post", SpeciesPreview);
CMS.init();
