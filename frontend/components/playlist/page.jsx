"use client";

import React, { useState, useEffect } from 'react';
import {
  Play,
  Download,
  MoreHorizontal,
  Heart,
  Clock,
  ArrowDown,
  ArrowUp,
  Plus,
  Search,
  List
} from 'lucide-react';

const PlaylistPage = ({ playlist }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTrackDropdown, setShowTrackDropdown] = useState(null);
  const [stickyHeader, setStickyHeader] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const handleScroll = () => {
      setStickyHeader(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLike = (trackId) => {
    const newLikedTracks = new Set(likedTracks);
    newLikedTracks.has(trackId)
      ? newLikedTracks.delete(trackId)
      : newLikedTracks.add(trackId);
    setLikedTracks(newLikedTracks);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortTracks = (field) => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    // You can implement actual sorting logic here
  };

  return (
    <div className="bg-gradient-to-b from-purple-900 via-gray-900 to-black min-h-screen text-white">
      {/* Sticky Header */}
      {stickyHeader && (
        <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-sm z-40 px-8 py-4 flex items-center gap-4">
          <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors">
            <Play className="w-5 h-5 text-black ml-1" fill="currentColor" />
          </button>
          <span className="text-xl font-bold">{playlist.name}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="px-8 pt-16">
        {/* Playlist Header */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-64 h-64 shadow-2xl">
            <img
              src={playlist.image}
              alt={playlist.name}
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-gray-300 mb-2">PLAYLIST</p>
            <h1 className="text-6xl font-black mb-4 leading-tight">{playlist.name}</h1>
            <p className="text-gray-300 mb-4 text-lg">{playlist.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white">{playlist.creator}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{playlist.followers.toLocaleString()} likes</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{playlist.songCount} songs</span>
              <span className="text-gray-400">• {playlist.totalDuration}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 mb-8">
          <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-all hover:scale-105">
            <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
          </button>
          <button className="w-8 h-8 text-gray-400 hover:text-white transition-colors">
            <Heart className="w-8 h-8" />
          </button>
          <button className="w-8 h-8 text-gray-400 hover:text-white transition-colors">
            <Download className="w-8 h-8" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-8 h-8" />
            </button>
            {showDropdown && (
              <div className="absolute top-10 left-0 bg-gray-800 rounded-md shadow-lg py-2 w-48 z-30">
                {['Add to queue', 'Edit playlist', 'Delete playlist', 'Share'].map((item, idx) => (
                  <button key={idx} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Track Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 mb-2">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 flex items-center gap-2">
            <span>Title</span>
            <button onClick={() => sortTracks('title')}>
              {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="col-span-3 flex items-center gap-2">
            <span>Album</span>
            <button onClick={() => sortTracks('album')}>
              {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span>Date added</span>
            <button onClick={() => sortTracks('dateAdded')}>
              {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="col-span-1 text-center">
            <Clock className="w-4 h-4 mx-auto" />
          </div>
        </div>

        {/* Track Rows */}
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              className={`grid grid-cols-12 gap-4 px-4 py-2 rounded-md group hover:bg-gray-800 transition-colors ${
                hoveredTrack === track.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="col-span-1 flex items-center justify-center text-gray-400 text-sm">
                {hoveredTrack === track.id ? (
                  <button className="w-4 h-4 text-white">
                    <Play className="w-4 h-4" fill="currentColor" />
                  </button>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="col-span-5 flex items-center gap-3">
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{track.title}</div>
                  <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                </div>
              </div>

              <div className="col-span-3 text-gray-400 text-sm truncate">{track.album}</div>
              <div className="col-span-2 text-gray-400 text-sm">{track.dateAdded}</div>

              <div className="col-span-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleLike(track.id)}
                  className={`w-4 h-4 transition-colors ${
                    likedTracks.has(track.id) ? 'text-green-500' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={likedTracks.has(track.id) ? 'currentColor' : 'none'} />
                </button>
                <span className="text-gray-400 text-sm">{track.duration}</span>
                <div className="relative">
                  <button
                    onClick={() => setShowTrackDropdown(showTrackDropdown === track.id ? null : track.id)}
                    className="w-4 h-4 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showTrackDropdown === track.id && (
                    <div className="absolute right-0 top-6 bg-gray-800 rounded-md shadow-lg py-2 w-48 z-20">
                      {['Add to queue', 'Remove from playlist', 'Go to artist', 'Go to album', 'Share'].map((action, i) => (
                        <button key={i} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors">
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
