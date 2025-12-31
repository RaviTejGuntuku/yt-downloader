from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import urllib.parse


def get_video_info(url: str):
    """Extract video info and download URLs using yt-dlp"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

        formats = []

        # Get video+audio formats
        for f in info.get('formats', []):
            if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                formats.append({
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': f.get('resolution', 'N/A'),
                    'filesize': f.get('filesize') or f.get('filesize_approx'),
                    'url': f.get('url'),
                    'type': 'video'
                })

        # Get best audio only
        for f in info.get('formats', []):
            if f.get('vcodec') == 'none' and f.get('acodec') != 'none':
                formats.append({
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': 'audio only',
                    'filesize': f.get('filesize') or f.get('filesize_approx'),
                    'url': f.get('url'),
                    'type': 'audio'
                })

        # Sort by filesize (larger = better quality usually)
        formats.sort(key=lambda x: x.get('filesize') or 0, reverse=True)

        # Limit to top formats
        video_formats = [f for f in formats if f['type'] == 'video'][:5]
        audio_formats = [f for f in formats if f['type'] == 'audio'][:2]

        return {
            'title': info.get('title'),
            'thumbnail': info.get('thumbnail'),
            'duration': info.get('duration'),
            'formats': video_formats + audio_formats
        }


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            parsed_path = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_path.query)

            url = query_params.get('url', [None])[0]

            if not url:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'URL parameter is required'}).encode())
                return

            # Get video info
            video_info = get_video_info(url)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(video_info).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
