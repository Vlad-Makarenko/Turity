import SpotifyWebApi from '../spotify-web-api-node/src/spotify-web-api.js';

const credentials = {
  clientId: '7891eb892a224f01886f1d424be6c643',
  clientSecret: 'c06f88450bc74137915ba8ddfe57254b',
  accessToken:
    // eslint-disable-next-line max-len
    'BQD9bncmdlsXhSt42FDkC5Ifbev84B--Vi1gQTEvauero20nTN8rgd6tWFZJ9bS6JZE4MDbg2FiB1TTwysv6HQ2W2dfGJn85gXgM1ocQTwnrF764mf4',
};

const spotifyApi = new SpotifyWebApi(credentials);

/**
 * Returns an array of objects with names,
 * links and audio features of the tracks.
 *
 * @param {number} tracksId
 * @return {object[]} tracks
 */
const getTracksMoodDescription = async (tracksId) => {
  const tracksFeatures = await getTracksFeatures(tracksId);
  const tracksInfo = await getTracksInfo(tracksId);
  const tracks = [];

  if (tracksFeatures.length !== tracksInfo.length) {
    console.error(`Couldn't get all features or tracks info`);
  }

  for (let idx = 0; idx < tracksFeatures.length; idx++) {
    tracks.push({info: tracksInfo[idx], features: tracksFeatures[idx]});
  }
  return tracks;
};

/**
 * Returns an array of objects with names and links for the tracks
 *
 * @param {string[]} tracksId
 * @return {object[]}
 */
const getTracksInfo = (tracksId) => {
  return new Promise((resolve, reject) => {
    spotifyApi.getTracks(tracksId).then((response) => {
      return resolve(
          response.body.tracks.map((track) => {
            return {name: track.name, link: track.external_urls.spotify};
          }),
      );
    });
  });
};

/**
 * Returns an array of objects with audio features for each track
 *
 * @param {string[]} tracksId
 * @return {object[]}
 */
const getTracksFeatures = (tracksId) => {
  return new Promise((resolve, reject) => {
    spotifyApi.getAudioFeaturesForTracks(tracksId).then((response) => {
      return resolve(response.body.audio_features);
    });
  });
};

/**
 * Returns an array of track's id from a given playlist
 *
 * @param {string} playlistId
 * @return {string[]}
 */
const getTracksId = async (playlistId) => {
  const playlistInfo = await getPlaylistTracks(playlistId);
  const tracksId = playlistInfo.map((data) => data.track.id);
  return tracksId;
};

/**
 * Returns an array of objects with a whole information about tracks
 * from a given playlist
 *
 * @param {string} playlistId
 * @return {object[]}
 */
const getPlaylistTracks = (playlistId) => {
  return new Promise((resolve, reject) => {
    spotifyApi.getPlaylistTracks(playlistId).then((response) => {
      resolve(response.body.items);
    });
  });
};

/**
 * Outputs to the console the info about the tracks from a playlist
 *
 * @param {string} playlistId
 */
const showPlaylistTracksInfo = async (playlistId) => {
  const ids = await getTracksId(playlistId);

  const tracksDescription = await getTracksMoodDescription(ids);
  tracksDescription.forEach((description) => {
    const features = description.features;

    console.table({
      name: description.info.name,
      link: description.info.link,
      energy: features.energy,
      danceability: features.danceability,
      loudness: features.loudness,
      acousticness: features.acousticness,
      liveness: features.liveness,
      valence: features.valence,
      tempo: features.tempo,
      speechiness: features.speechiness,
      instrumentalness: features.instrumentalness,
    });
  });
};

showPlaylistTracksInfo('37i9dQZF1DZ06evO4r8o3S');
