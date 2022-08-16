import SpotifyWebApi from '../spotify-web-api-node/src/spotify-web-api.js';

const credentials = {
  clientId: '7891eb892a224f01886f1d424be6c643',
  clientSecret: 'c06f88450bc74137915ba8ddfe57254b',
  accessToken:
    'accessToken',
};

const spotifyApi = new SpotifyWebApi(credentials);

spotifyApi.getPlaylistTracks('37i9dQZF1DZ06evO4r8o3S').then((response) => {
  const tracks = response.body.items;
  const tracksId = tracks.map((data) => data.track.id);

  spotifyApi.getAudioFeaturesForTracks(tracksId).then((data) => {
    const features = data.body.audio_features;
    const valence = features.reduce((sum, properties) => {
      console.table({
        energy: properties.energy,
        danceability: properties.danceability,
        loudness: properties.loudness,
        acousticness: properties.acousticness,
        liveness: properties.liveness,
        valence: properties.valence,
        tempo: properties.tempo,
        id: properties.id
      });
      return sum + properties.valence;
    }, 0);

    const mood = valence / features.length < 0.3 ? 'sad' : 'happy';

    console.table({valence: valence / features.length, mood});
  });
});

const analyzeTrack = (trackId) => {
  spotifyApi.getAudioFeaturesForTrack(trackId).then((data) => {
    console.log(data);
  });
};
