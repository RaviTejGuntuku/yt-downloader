'use client'

import { useState } from 'react'

interface Format {
  format_id: string
  ext: string
  resolution: string
  filesize: number | null
  url: string
  type: 'video' | 'audio'
}

interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  formats: Format[]
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(1)} GB`
  }
  return `${mb.toFixed(1)} MB`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setVideoInfo(null)

    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setVideoInfo(data)
      }
    } catch {
      setError('Failed to fetch video info. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const videoFormats = videoInfo?.formats.filter(f => f.type === 'video') || []
  const audioFormats = videoInfo?.formats.filter(f => f.type === 'audio') || []

  return (
    <div className="container">
      <h1>YT Downloader</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !url.trim()}>
            Go
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Fetching video info...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {videoInfo && (
        <>
          <div className="video-info">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="thumbnail"
            />
            <div className="video-title">{videoInfo.title}</div>
            <div className="duration">
              Duration: {formatDuration(videoInfo.duration)}
            </div>
          </div>

          {videoFormats.length > 0 && (
            <>
              <div className="section-title">Video</div>
              <div className="formats">
                {videoFormats.map((format) => (
                  <a
                    key={format.format_id}
                    href={format.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="format-btn"
                  >
                    <div className="format-left">
                      <span className="format-quality">{format.resolution}</span>
                      <span className="format-ext">{format.ext.toUpperCase()}</span>
                    </div>
                    <span className="format-size">{formatBytes(format.filesize)}</span>
                  </a>
                ))}
              </div>
            </>
          )}

          {audioFormats.length > 0 && (
            <>
              <div className="section-title">Audio Only</div>
              <div className="formats">
                {audioFormats.map((format) => (
                  <a
                    key={format.format_id}
                    href={format.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="format-btn"
                  >
                    <div className="format-left">
                      <span className="format-quality">Audio</span>
                      <span className="format-ext">{format.ext.toUpperCase()}</span>
                    </div>
                    <span className="format-size">{formatBytes(format.filesize)}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
