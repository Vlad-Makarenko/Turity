import SpotifyWebApi from '../spotify-web-api-node/src/spotify-web-api.js';

const credentials = {
  clientId: '2227cc901288429abd075d6727d534ee',
  clientSecret: '600914135c794a41a78ac5a2aed18163',
  accessToken: 'BQCMZaisySGYUrj8mthNwUzbQnHHdGPLVMPJ0OkGxf9gFCr-LpQW_jN0B7ZYd4FZusrBkdmNSv0t5zwhgrYx_lAkUybWkmmPIwKoVXQ5IvqXX7MrUX4'
};

const spotifyApi = new SpotifyWebApi(credentials);

// spotifyApi.getTrack('6vsEeepIYXoNMC7ROPfXoR').then((data) => {
//   console.log(data);
// })

// spotifyApi.getAudioFeaturesForTrack('6vsEeepIYXoNMC7ROPfXoR').then((data) => {
//   console.log(data);
// }, (error) => {
//   console.log(error);
// });

spotifyApi.getMyTopTracks({limit: 10})
  .then(function(data) {
    let topTracks = data.body.items;
    console.log(topTracks);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

