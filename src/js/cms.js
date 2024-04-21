import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";


CMS.registerEventListener({
    name: 'preSave',
    collection: 'species',
    handler: ({ entry }) => {
      // Assume `entry` is the full entry object which includes the data object
      const uuid = entry.data.uuid;
      // Modify the entry directly
      entry.data.slug = uuid;
      entry.data.path = `site/content/species/${uuid}/_index.md`;
  
      // Return the modified entry
      return entry;
    }
  });
  
  
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
