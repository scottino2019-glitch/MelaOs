import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, SkipForward, SkipBack, 
  Plus, List, FileText, Check, BookOpen, Clock, Trash, AlertCircle, Bookmark, Link2
} from 'lucide-react';
import { VideoItem } from '../types';

interface AppVideoPlayerProps {
  onNotification: (title: string, msg: string) => void;
  // Let the parent App have hooks for the media control widget
  onMediaStateChange?: (title: string, isPlaying: boolean, onTogglePlay: () => void) => void;
  systemVolume?: number;
  onSystemVolumeChange?: (vol: number) => void;
}

const DEFAULT_PLAYLIST: VideoItem[] = [
  {
    id: 'vid1',
    title: 'Big Buck Bunny (Cortometraggio Animato)',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80',
    duration: '0:10',
    category: 'Animazione',
    description: 'Il celebre coniglio gigante della Blender Foundation in un test video ad altissima compatibilità HTML5.'
  },
  {
    id: 'vid2',
    title: 'Sintel (Trailer d\'Animazione CGI)',
    url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    duration: '0:52',
    category: 'Animazione',
    description: 'Trailer ufficiale CGI open-source realizzato dalla Blender Foundation per test di streaming.'
  },
  {
    id: 'vid3',
    title: 'Teaser d\'Animazione (Test Clip)',
    url: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=300&q=80',
    duration: '0:12',
    category: 'Test',
    description: 'Un piccolo frammento di video ad alta fedeltà di caricamento per garantire una fluidità perfetta anche su schermi mobili.'
  }
];

interface BookmarkNote {
  id: string;
  timeSeconds: number;
  timeLabel: string;
  noteText: string;
}

export default function AppVideoPlayer({ onNotification, onMediaStateChange, systemVolume, onSystemVolumeChange }: AppVideoPlayerProps) {
  const [playlist, setPlaylist] = useState<VideoItem[]>(DEFAULT_PLAYLIST);
  const [activeVideoId, setActiveVideoId] = useState<string>(DEFAULT_PLAYLIST[0].id);
  const activeVideo = playlist.find(v => v.id === activeVideoId) || playlist[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Dynamic timestamp bookmark list for active video
  const [bookmarks, setBookmarks] = useState<Record<string, BookmarkNote[]>>({
    vid1: [
      { id: 'b1', timeSeconds: 15, timeLabel: '0:15', noteText: 'Inizio della sequenza cinematografica.' }
    ]
  });
  const activeBookmarks = bookmarks[activeVideoId] || [];
  const [newBookmarkText, setNewBookmarkText] = useState<string>('');

  // Form states for adding custom video link
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Studio');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const lastSyncedMediaRef = useRef<{ title: string; isPlaying: boolean } | null>(null);

  useEffect(() => {
    // Reset player details on playlist active item swap
    setIsPlaying(false);
    setCurrentTime(0);
    setNewBookmarkText('');
  }, [activeVideoId]);

  // Synchronize system volume settings (slider & sidebar frame buttons) to video element
  useEffect(() => {
    if (systemVolume !== undefined) {
      const volFraction = systemVolume / 100;
      const video = videoRef.current;
      if (video) {
        video.volume = volFraction;
        video.muted = volFraction === 0;
      }
      setVolume(volFraction);
      setIsMuted(volFraction === 0);
    }
  }, [systemVolume, activeVideoId]);

  // Sync state up to App so widget reflects correct status
  useEffect(() => {
    if (onMediaStateChange && activeVideo) {
      const title = activeVideo.title;
      const cached = lastSyncedMediaRef.current;
      if (cached && cached.title === title && cached.isPlaying === isPlaying) {
        return;
      }
      lastSyncedMediaRef.current = { title, isPlaying };
      onMediaStateChange(
        title,
        isPlaying,
        () => handleOnTogglePlay()
      );
    }
  }, [isPlaying, activeVideo, onMediaStateChange]);

  const handleOnTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(e.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    onNotification("Video", `Velocità impostata a ${speed}x`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = Number(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
    if (onSystemVolumeChange) {
      onSystemVolumeChange(Math.round(val * 100));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
    if (onSystemVolumeChange) {
      onSystemVolumeChange(nextMute ? 0 : 50);
    }
  };

  // Skip buttons
  const skipForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 5;
  };
  const skipBackward = () => {
    if (videoRef.current) videoRef.current.currentTime -= 5;
  };

  // Bookmarking flow
  const handleAddBookmark = () => {
    if (!newBookmarkText.trim()) return;
    
    const timeSec = Math.round(currentTime);
    const m = Math.floor(timeSec / 60);
    const s = Math.floor(timeSec % 60);
    const label = `${m}:${String(s).padStart(2, '0')}`;

    const newB: BookmarkNote = {
      id: 'bookmark_' + Date.now(),
      timeSeconds: timeSec,
      timeLabel: label,
      noteText: newBookmarkText.trim()
    };

    setBookmarks(prev => ({
      ...prev,
      [activeVideoId]: [...(prev[activeVideoId] || []), newB].sort((a,b) => a.timeSeconds - b.timeSeconds)
    }));

    setNewBookmarkText('');
    onNotification("Bookmarks", `Annotazione registrata a ${label}`);
  };

  const handleDeleteBookmark = (bId: string) => {
    setBookmarks(prev => ({
      ...prev,
      [activeVideoId]: (prev[activeVideoId] || []).filter(b => b.id !== bId)
    }));
  };

  const handleJumpToBookmark = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Add custom URL
  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customUrl.trim()) return;

    const newVideoItem: VideoItem = {
      id: 'custom_' + Date.now(),
      title: customTitle.trim(),
      url: customUrl.trim(),
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      duration: 'URL',
      category: customCategory,
      description: customDesc.trim() || 'Video aggiunto dall\'utente tramite URL esterno.'
    };

    setPlaylist(prev => [...prev, newVideoItem]);
    setActiveVideoId(newVideoItem.id);
    
    // reset form
    setCustomTitle('');
    setCustomUrl('');
    setCustomCategory('Studio');
    setCustomDesc('');
    setShowAddForm(false);
    onNotification("Playlists", "Nuovo stream video registrato!");
  };

  const formatTimeLabel = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const [mobileTab, setMobileTab] = useState<'video' | 'playlist' | 'notes'>('video');

  return (
    <div id="app-video" className="flex flex-col lg:flex-row h-full w-full bg-zinc-950 text-white rounded-3xl select-none overflow-hidden font-sans">
      
      {/* Mobile view Tab selection bar */}
      <div className="flex lg:hidden bg-zinc-900 border-b border-zinc-805/85 p-1.5 shrink-0 z-10 w-full justify-around space-x-1">
        <button
          onClick={() => setMobileTab('video')}
          className={`flex-1 py-1 px-1.5 rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center space-x-1 transition ${
            mobileTab === 'video' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Video</span>
        </button>
        <button
          onClick={() => setMobileTab('playlist')}
          className={`flex-1 py-1 px-1.5 rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center space-x-1 transition ${
            mobileTab === 'playlist' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Playlist</span>
        </button>
        <button
          onClick={() => setMobileTab('notes')}
          className={`flex-1 py-1 px-1.5 rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center space-x-1 transition ${
            mobileTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Note ({activeBookmarks.length})</span>
        </button>
      </div>

      {/* Player and Bookmarks main wrapper */}
      <div className={`flex-1 flex-col justify-between p-3 lg:p-6 min-h-0 overflow-y-auto ${
        mobileTab === 'video' || mobileTab === 'notes' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Aspect Ratio Box holding the actual element */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl group flex-col shrink-0 ${
          mobileTab === 'video' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="relative aspect-video w-full bg-black">
            <video
              ref={videoRef}
              src={activeVideo.url}
              onClick={handleOnTogglePlay}
              onTimeUpdate={handleProgress}
              onLoadedMetadata={handleMetadata}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Simulated Watermark logo top right */}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5 text-[9px] tracking-wider text-white/50 font-semibold select-none uppercase">
              Apple Player
            </div>
            
            {/* Play Overlay on pause */}
            {!isPlaying && (
              <div 
                onClick={handleOnTogglePlay}
                className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer transition group-hover:bg-black/45"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/15 scale-100 hover:scale-105 rounded-full flex items-center justify-center border border-white/20 transition-all shadow-xl text-white">
                  <Play className="w-5 h-5 ml-1 text-white fill-white" />
                </div>
              </div>
            )}
          </div>

          {/* Integrated Control HUD under aspect-ratio video player */}
          <div className="p-3 bg-zinc-900/95 border-t border-zinc-800/60 text-xs">
            
            {/* Scrubber slider bar */}
            <div className="flex items-center space-x-2.5 mb-2.5">
              <span className="font-mono text-[9px] text-zinc-400">{formatTimeLabel(currentTime)}</span>
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[9px] text-zinc-400">{formatTimeLabel(duration)}</span>
            </div>

            {/* Buttons alignment bars */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              
              {/* Skip & Speed parameters controls */}
              <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center space-x-1">
                  <button onClick={skipBackward} className="p-1 px-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition" title="Indietro 5 sec">
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleOnTogglePlay}
                    className="bg-blue-600 hover:bg-blue-500 hover:scale-103 active:scale-97 text-white w-7.5 h-7.5 rounded-full flex items-center justify-center transition shadow-md shadow-blue-600/10"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 text-white fill-white" />}
                  </button>
                  <button onClick={skipForward} className="p-1 px-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition" title="Avanti 5 sec">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="hidden md:block w-px h-4 bg-zinc-850 mx-1" />

                {/* Speed indicator selector */}
                <div className="flex items-center space-x-0.5 bg-zinc-850/80 p-0.5 rounded-lg border border-white/5">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        playbackSpeed === speed ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume & Details Indicators */}
              <div className="hidden md:flex items-center space-x-2 w-full md:w-auto justify-end">
                <button onClick={toggleMute} className="hover:text-blue-400 transition text-zinc-300">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Studio Annotations Workspace Block */}
        <div className={`mt-3 lg:mt-6 bg-zinc-900 border border-zinc-800 p-4 lg:p-5 rounded-3xl space-y-3.5 ${
          mobileTab === 'notes' ? 'flex flex-col flex-1' : 'hidden lg:flex lg:flex-col shrink-0'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-1.5">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-xs font-bold tracking-tight">Studio Notes (Annotazioni Video)</h3>
            </div>
            <span className="text-[9px] bg-zinc-800 border border-white/5 py-0.5 px-2 rounded-lg text-zinc-400">
              {activeBookmarks.length} Annotazioni
            </span>
          </div>

          {/* Bookmarks Insertion panel */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Aggiungi una nota al timestamp corrente..."
              value={newBookmarkText}
              onChange={(e) => setNewBookmarkText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
              className="flex-1 bg-zinc-950 focus:bg-black/90 p-2 px-3 text-xs rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button
              onClick={handleAddBookmark}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-[10px] font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 text-white whitespace-nowrap"
            >
              <Clock className="w-3 h-3" />
              <span>Inserisci nota a {formatTimeLabel(currentTime)}</span>
            </button>
          </div>

          {/* Bookmark list scrolling */}
          <div className="space-y-2 flex-1 lg:max-h-[160px] overflow-y-auto pr-1">
            {activeBookmarks.length > 0 ? (
              activeBookmarks.map(bm => (
                <div
                  key={bm.id}
                  className="bg-zinc-950 hover:bg-black border border-zinc-900 rounded-xl p-2.5 flex items-start justify-between transition-colors group"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2 text-[9px] mb-1 font-bold">
                      <span 
                        onClick={() => handleJumpToBookmark(bm.timeSeconds)}
                        className="bg-amber-400/10 hover:bg-amber-400/20 text-text-amber-400 text-amber-300 rounded px-1.5 py-0.2 cursor-pointer flex items-center space-x-1 border border-amber-500/10"
                        title="Clicca per saltare a questo secondo"
                      >
                        <Play className="w-2 h-2 fill-current" />
                        <span>{bm.timeLabel}</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">"{bm.noteText}"</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(bm.id)}
                    className="p-1 opacity-60 hover:opacity-100 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition"
                    title="Rimuovi"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-zinc-500 italic">
                Nessuna annotazione su questo video. Inseriscile sopra per tenere traccia delle tue lezioni!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Media List Workspace sidebar (Playlist panel) - right view */}
      <div className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-900 bg-zinc-900/40 backdrop-blur-xl p-4 lg:p-5 flex flex-col justify-between min-h-0 ${
        mobileTab === 'playlist' ? 'flex flex-1' : 'hidden lg:flex'
      }`}>
        <div className="flex-1 flex flex-col space-y-3.5 min-h-0">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-400">Media Library</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-zinc-800 hover:bg-zinc-700 font-bold text-[9px] py-1 px-2 rounded-lg flex items-center space-x-1 text-white border border-white/5"
            >
              <Plus className="w-3 h-3" />
              <span>Stream</span>
            </button>
          </div>

          {/* Collapsible custom streaming setup form */}
          {showAddForm && (
            <form onSubmit={handleAddCustomVideo} className="bg-zinc-950 p-3 border border-zinc-800 rounded-2xl text-xs space-y-2.5">
              <div className="font-bold flex items-center space-x-1 text-blue-400 border-b border-zinc-800 pb-1 mb-1.5">
                <Link2 className="w-3 h-3" />
                <span>Registra Link Video</span>
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] text-zinc-505 font-bold block text-zinc-400">Titolo</label>
                <input
                  type="text"
                  required
                  placeholder="es. Video Tutorial Node.js"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] text-zinc-505 font-bold block text-zinc-400">Indirizzo .MP4 URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/videoloop.mp4"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-0.5">
                  <label className="text-[9px] text-zinc-505 font-bold block text-zinc-400">Categoria</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-1.5 py-0.5 text-[11px]"
                  >
                    <option value="Studio">Studio</option>
                    <option value="Riposo">Riposo</option>
                    <option value="Presentazione">Promo</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-1 rounded transition text-[10px]">
                    Aggiungi
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Playlist Scroller items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
            {playlist.map(vid => {
              const isActive = vid.id === activeVideoId;
              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideoId(vid.id)}
                  className={`p-2 rounded-2xl cursor-pointer border transition flex flex-col justify-between ${
                    isActive 
                      ? 'bg-blue-600/15 border-blue-500 shadow-lg' 
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between space-x-2">
                    {/* Tiny Thumbnail preview cover */}
                    <div className="w-14 aspect-video bg-zinc-805 border border-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src={vid.thumbnail} alt="Poster" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/75 px-1 py-0.2 rounded font-mono text-[7px] text-white">
                        {vid.duration}
                      </span>
                    </div>

                    {/* Meta info details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-semibold text-white leading-tight truncate">{vid.title}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5 italic max-h-[1.5em] overflow-hidden leading-relaxed text-ellipsis">
                        {vid.category}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Media Bottom Recap details panel */}
        <div className="pt-3 border-t border-zinc-900 mt-3 space-y-1 shrink-0">
          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Video Corrente</span>
          <p className="text-xs font-semibold text-zinc-200 leading-tight truncate">{activeVideo.title}</p>
          <p className="text-[9px] text-zinc-400 leading-relaxed max-h-[3em] overflow-y-auto">
            {activeVideo.description}
          </p>
        </div>
      </div>

    </div>
  );
}
