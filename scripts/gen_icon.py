#!/usr/bin/env python3
"""Generate a simple tray icon for VibeCheck"""
import struct, zlib, os

def create_png(width, height, pixels):
    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    raw = b''
    for row in pixels:
        raw += b'\x00'
        for r, g, b in row:
            raw += bytes([r, g, b])

    idat = zlib.compress(raw)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', idat)
    png += chunk(b'IEND', b'')
    return png

# 22x22 icon - purple crystal ball emoji style
size = 22
pixels = []
cx, cy = size // 2, size // 2
r = size // 2 - 1

for y in range(size):
    row = []
    for x in range(size):
        dx = x - cx
        dy = y - cy
        dist = (dx*dx + dy*dy) ** 0.5

        if dist <= r:
            # Purple gradient
            t = dist / r
            px = int(124 * (1 - t * 0.3))
            py = int(58 * (1 - t * 0.3))
            pz = int(237 * (1 - t * 0.2))
            # Highlight
            if dx < -2 and dy < -2 and dist < r * 0.5:
                px = min(255, px + 80)
                py = min(255, py + 60)
                pz = min(255, pz + 30)
            row.append((px, py, pz))
        else:
            row.append((0, 0, 0))  # transparent-ish, will be black on tray
    pixels.append(row)

out = os.path.join(os.path.dirname(__file__), '..', 'src', 'tray-icon.png')
with open(out, 'wb') as f:
    f.write(create_png(size, size, pixels))

print("tray-icon.png generated")
