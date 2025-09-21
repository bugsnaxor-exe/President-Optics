


import * as React from 'react';
import { useAudioPlayer, AudioPlayerProvider } from 'react-use-audio-player';
import { searchTracks, testSpotifyConnection } from '@/lib/spotify';
import { songs } from '@/lib/data';

import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

const formatTime = (seconds) => {
  const floored = Math.floor(seconds);
  const min = Math.floor(floored / 60);
  const sec = floored % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

function Player() {
  const {
    playing,
    duration,
    getPosition,
    volume,
    setVolume,
    togglePlayPause,
    seek,
    load,
    isReady,
    error,
  } = useAudioPlayer();

  const [songIndex, setSongIndex] = React.useState(0);
  const [showPlaylist, setShowPlaylist] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [currentVolume, setCurrentVolume] = React.useState(volume);
  const [spotifyTracks, setSpotifyTracks] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [useSpotify, setUseSpotify] = React.useState(false);
  const searchTimeoutRef = React.useRef(null);

  const currentPlaylist = useSpotify ? spotifyTracks : songs;
  const currentSong = currentPlaylist && currentPlaylist.length > 0 ? currentPlaylist[Math.min(songIndex, currentPlaylist.length - 1)] : null;

  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    setSongIndex((prev) => (prev + 1) % currentPlaylist.length);
  };

  React.useEffect(() => {
    if (currentSong && load && currentSong.audioSrc) {
      try {
        load({
          src: currentSong.audioSrc,
          autoplay: playing,
          html5: true,
          format: useSpotify ? ["mp3"] : ["mp3"],
          onend: handleNext,
        });
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songIndex, load, playing, handleNext, useSpotify]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (playing && typeof getPosition === 'function') {
        setPosition(getPosition());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, getPosition]);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setCurrentVolume(volume);
  }, [volume]);


  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    setSongIndex((prev) => (prev - 1 + currentPlaylist.length) % currentPlaylist.length);
  };

  const handleSongSelect = (index) => {
    setSongIndex(index);
    setShowPlaylist(false);
    if (!playing) {
      togglePlayPause();
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const tracks = await searchTracks(searchQuery);
      setSpotifyTracks(tracks || []);
      setUseSpotify(true);
      setSongIndex(0);
      setShowPlaylist(false);
    } catch (error) {
      console.error('Search failed:', error);
      setSpotifyTracks([]);
      setUseSpotify(false);
    } finally {
      setIsSearching(false);
    }
  }

  const switchToLocal = () => {
    setUseSpotify(false);
    setSongIndex(0);
    setShowPlaylist(false);
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setCurrentVolume(newVolume);
  }

  const toggleMute = () => {
    if (currentVolume > 0) {
      setVolume(0);
      setCurrentVolume(0);
    } else {
      setVolume(0.5); // Restore to a default volume
      setCurrentVolume(0.5);
    }
  }


  if (!currentSong) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-4">
          <p>No tracks available. {useSpotify ? 'Search for Spotify tracks above.' : 'No local tracks found.'}</p>
        </div>
      </div>
    );
  }

  if (useSpotify && !currentSong.audioSrc) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-4">
          <p>This track doesn't have a preview available.</p>
          <p className="text-sm text-muted-foreground">Try searching for a different track.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isReady && (
        <div className="text-center py-4">
          <p>Loading audio...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500">
          <p>Error loading audio: {error}</p>
        </div>
      )}

      {/* Search Section */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search Spotify tracks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
              if (e.target.value.trim()) {
                handleSearch();
              }
            }, 500);
          }}
          className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={switchToLocal}
          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md"
        >
          Local
        </button>
        <button
          onClick={async () => {
            const result = await testSpotifyConnection();
            alert(result ? 'Spotify connection successful!' : 'Spotify connection failed. Check console for details.');
          }}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md"
        >
          Test Spotify
        </button>
      </div>

      <div className="relative">
        <img
          src={currentSong.albumArtUrl}
          alt={currentSong.title}
          className={cn("w-full rounded-md object-cover transition-all", showPlaylist && "blur-sm brightness-50")}
          data-ai-hint="album art"
        />

        {showPlaylist && (
          <div className="absolute inset-0">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">
                  Playlist ({useSpotify ? 'Spotify' : 'Local'})
                </h3>
                <ul className="space-y-2">
                  {currentPlaylist.map((song, index) => (
                    <li
                      key={song.id || index}
                      onClick={() => {
                        if (useSpotify && !song.audioSrc) return; // Don't allow selection of tracks without previews
                        handleSongSelect(index);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                        songIndex === index ? "bg-primary/80" : "bg-black/50 hover:bg-black/70",
                        useSpotify && !song.audioSrc ? "opacity-50 cursor-not-allowed" : ""
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={song.albumArtUrl} />
                        <AvatarFallback>{song.title[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">{song.title}</p>
                        <p className="text-xs text-white/70">{song.artist}</p>
                        {useSpotify && !song.audioSrc && (
                          <p className="text-xs text-red-400">No preview available</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={currentSong.albumArtUrl} />
            <AvatarFallback>{currentSong.title[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold truncate">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowPlaylist(p => !p)}>
          <ListMusic className="h-5 w-5" />
        </Button>
      </div>

      <div>
        <Slider
          value={[position]}
          max={duration}
          onValueChange={(value) => seek(value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(position)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
          >
            {currentVolume > 0 ? <Volume2 /> : <VolumeX />}
          </Button>
          <Slider
            value={[currentVolume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <SkipBack />
          </Button>
          <Button size="icon" onClick={togglePlayPause}>
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <SkipForward />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MusicPlayer() {
  return (
    <AudioPlayerProvider>
      <Player />
    </AudioPlayerProvider>
  )
}
