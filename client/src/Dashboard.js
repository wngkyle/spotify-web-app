import React from "react";
import useAuth from "./useAuth";
import { Container, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
// Spotify web api node is actually usable in the browser even though it's called api
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "1d9ed032c07a461d803df4e905fcae3c",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState();
  const [searchResults, setSearchResults] = useState();
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  let cancel = false;
  useEffect(() => {
    if (!accessToken) return; // check first if there is an access token, if not, then return
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    // Since everytime you type something even just a character, a new request is processed
    // So additional requests is processed even before you finish typing the search word you want
    // The problem is some of these requests are shorter but some are longer
    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      // Some requests might come back faster and others might come back slower
      // So we need a way to cancel api request
      setSearchResults(
        res.body.tracks.items.map((track) => {
          // Over here we want to get the smallest image
          // So we use .reduce() loop through? all the images to find the smallest
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0] // this defines the starting point, where in this case is the first image
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
    // What this is going to do is: make a new request, and if a new request is made in this time period,
    // we are going to set the 'cancel' of the previous request to true, which in turn cancel the request
    // for the next run
  }, [search, accessToken]);

  useEffect(() => {
    // Check first if there is a playingTrack
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      }) 
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search songs and artists..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults?.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
        {searchResults?.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
