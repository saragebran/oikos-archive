import React from "react";
import { useMediaAsset } from "@staticcms/core";

const RepresentationsPreview = ({ entry, collection, field }) => {
  const imageSource = useMediaAsset(entry.data.image, collection, field, entry);

  return (
    <div className="mw9 center mt5 mb5 min-vh-100">
      <div className="flex flex-wrap mhn1 pa3 justify-center">
        <div id="image-container" className="flex flex-column justify-center pa3">
          {imageSource && <img className="mht6" role="presentation" src={imageSource} alt={entry.data.title || 'No Title Available'} />}
          <div className="pt3"> {/* Added pt3 for some padding-top */}
            <div><i className="i">{entry.data.title || "Untitled"}</i> ({entry.data.year || "?"})</div>
            <div>{entry.data.author || "Unknown Artist"}</div>
            <div>{entry.data.contact || "?"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentationsPreview;
