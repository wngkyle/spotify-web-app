import React from "react";

// ISSUES: why do we wrap the parameters with curly braces
export default function TrackSearchResult({track, chooseTrack}) {
  function handlePlay() {
    chooseTrack(track)
  }

  return ( 
    <div
      className="d-flex m-2"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <img src={track.albumUrl} style={{ heigh: "64px", width: "64p x" }} />
      <div className="mx-3 my-1">
        <div className="ml-3">{track.title}</div>
        <div className="text-muted">{track.artist}</div>
      </div>
    </div>
  );
}

