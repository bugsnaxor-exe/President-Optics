const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

console.log('Spotify Client ID loaded:', CLIENT_ID ? 'Yes' : 'No');
console.log('Spotify Client Secret loaded:', CLIENT_SECRET ? 'Yes' : 'No');

let accessToken = null;
let tokenExpiry = null;

export const getAccessToken = async () => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached Spotify token');
    return accessToken;
  }

  try {
    console.log('Requesting new Spotify access token...');
    console.log('Client ID:', CLIENT_ID);
    console.log('Client Secret:', CLIENT_SECRET ? 'Present' : 'Missing');

    const credentials = CLIENT_ID + ':' + CLIENT_SECRET;
    console.log('Credentials string:', credentials);

    const encodedCredentials = btoa(credentials);
    console.log('Base64 encoded credentials:', encodedCredentials);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + encodedCredentials
      },
      body: 'grant_type=client_credentials'
    });

    console.log('Token response status:', response.status);
    console.log('Token response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token response error:', errorText);

      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (parseError) {
        console.error('Could not parse error as JSON');
      }

      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Token response data:', data);
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
};

export const searchTracks = async (query, limit = 10) => {
  try {
    console.log('Searching for tracks:', query);
    const token = await getAccessToken();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
    console.log('Search URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Search response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search response error:', errorText);
      throw new Error(`Failed to search tracks: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Search results:', data);

    const tracks = data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      albumArtUrl: track.album.images[0]?.url || 'https://picsum.photos/300/300',
      audioSrc: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      duration: track.duration_ms
    }));

    console.log('All tracks found:', tracks.length);
    console.log('Tracks with previews:', tracks.filter(t => t.audioSrc).length);

    // Return all tracks, but mark those without previews
    return tracks.map(track => ({
      ...track,
      hasPreview: !!track.audioSrc
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const getTrack = async (trackId) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get track');
    }

    const track = await response.json();
    return {
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      albumArtUrl: track.album.images[0]?.url || 'https://picsum.photos/300/300',
      audioSrc: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      duration: track.duration_ms
    };
  } catch (error) {
    console.error('Error getting track:', error);
    throw error;
  }
};

// Test function to check if Spotify API is working
export const testSpotifyConnection = async () => {
  try {
    console.log('Testing Spotify connection...');
    const token = await getAccessToken();
    console.log('Token obtained successfully');

    const response = await fetch('https://api.spotify.com/v1/search?q=hello&type=track&limit=1', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Test search response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Test search successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('Test search failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Spotify connection test failed:', error);
    return false;
  }
};