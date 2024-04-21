import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";
import RepresentationsPreview from "./cms-preview-templates/representations";


  // Listen for ALL preSave events
  CMS.registerEventListener({
    name: 'preSave',
    collection: 'species',
    handler: ({ entry }) => {
        if (entry && entry.data) {
            const uuid = entry.data.uuid;  // Accessing UUID from the nested data
            // Update the slug and path within the nested entry data
            const updatedEntryData = {
                ...entry.data,
                slug: uuid,
                path: `site/content/species/${uuid}/_index.md`
            };

            // Return the updated entry object at the top level
            return {
                ...entry,
                data: updatedEntryData
            };
        }
        return entry;  // Return unchanged entry if conditions aren't met
    }
});
  

  

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("species", SpeciesPreview);
CMS.registerPreviewTemplate("representations", RepresentationsPreview);
CMS.init();
