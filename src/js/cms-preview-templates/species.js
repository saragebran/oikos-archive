import { useMediaAsset } from "@staticcms/core";
import React from "react";

const SpeciesPreview = ({ entry, widgetFor }) => {

// Function to render languages and their respective names
const renderLanguages = (languages) => {
  if (!Array.isArray(languages)) {
    return <p>Language: </p>;
  }

  return languages.map((lang, index) => {
    if (!Array.isArray(lang.names)) {
      return <li key={index}>{lang.language}?</li>;
    }
    return (
      <li key={index}>
        {lang.language}: {lang.names.join(', ')}
      </li>
    );
  });
};

// Function to get the first name from the first language
const getAlternativeScientificName = () => {
  if (Array.isArray(entry.data.languages) && entry.data.languages.length > 0) {
    const firstLanguage = entry.data.languages[0];
    if (Array.isArray(firstLanguage.names) && firstLanguage.names.length > 0) {
      return firstLanguage.names[0];
    }
  }
  return 'Unknown';
};


return (
  <div className="mw6 center ph3 pv4 cms">
    <div style={{ backgroundColor: entry.data.color }}>
      <h1 className="f2 pl1 lh-title b mb3 title-white">
        {entry.data.scientificName || getAlternativeScientificName()}
      </h1>
    </div>
    <div className="flex justify-between items-center">
      <p>{`Species Category: ${entry.data.category}`}</p>
    </div>
    <h2>Names in different Languages</h2>
    <ul>{renderLanguages(entry.data.languages)}</ul>
    <div className="cms mw6">
      <div className="pt2">----</div>
      <div><h2>Collective knowledge and stories about {entry.data.scientificName || 'the ' + getAlternativeScientificName()}</h2></div>
      {widgetFor("body")}
    </div>
  </div>
);
};

export default SpeciesPreview;
