import React from "react";
import { useMediaAsset } from "@staticcms/core";

const RepresentationsPreview = ({ entry, widgetFor }) => {
  const image = useMediaAsset(entry.data.image, entry);

  return (
    <div className="mw6 center ph3 pv4">
      <h1 className="f2 lh-title b mb3">{entry.data.title || 'No Title Available'}</h1>
      <div>
        <p>{`Kind: ${entry.data.kind || 'No Kind Specified'}`}</p>
        <p>{`Species ID: ${entry.data.speciesid || 'No Species ID'}`}</p>
        <p>{`Description: ${entry.data.description || 'No Description Available'}`}</p>
      </div>
      {image && <img src={image} alt={`Image for ${entry.data.title}`} />}
      <div className="cms mw6">
        {widgetFor("body")}
      </div>
    </div>
  );
};

export default RepresentationsPreview;
