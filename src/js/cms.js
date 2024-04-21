import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";


  // Listen for ALL preSave events
  CMS.registerEventListener({
    name: 'preSave',
    collection: 'species',
    handler: ({ data, collection, field }) => {
      console.log('data: ' + data.uuid);
      console.log('collection: ' + collection);
    },
  });
  
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
