import CMS from "@staticcms/core";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import SpeciesPreview from "./cms-preview-templates/species";

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("post", SpeciesPreview);
CMS.init();
