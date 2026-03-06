from __future__ import annotations

from pathlib import Path
import struct
import zlib

OUT = Path('assets/generated')
OUT.mkdir(parents=True, exist_ok=True)


def clamp(v: int) -> int:
    return 0 if v < 0 else 255 if v > 255 else v


class Image:
    def __init__(self, width: int, height: int, bg=(91, 191, 88, 255)) -> None:
        self.width = width
        self.height = height
        self.px = [list(bg) for _ in range(width * height)]

    def _idx(self, x: int, y: int) -> int:
        return y * self.width + x

    def set(self, x: int, y: int, c) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            self.px[self._idx(x, y)] = [clamp(c[0]), clamp(c[1]), clamp(c[2]), clamp(c[3])]

    def get(self, x: int, y: int):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.px[self._idx(x, y)]
        return [0, 0, 0, 0]

    def rect(self, x: int, y: int, w: int, h: int, c) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def triangle(self, p1, p2, p3, c) -> None:
        pts = sorted([p1, p2, p3], key=lambda p: p[1])
        (x1, y1), (x2, y2), (x3, y3) = pts

        def interp(y, xa, ya, xb, yb):
            if yb == ya:
                return xa
            return int(xa + (xb - xa) * ((y - ya) / (yb - ya)))

        for y in range(y1, y3 + 1):
            if y < y2:
                xa = interp(y, x1, y1, x2, y2)
                xb = interp(y, x1, y1, x3, y3)
            else:
                xa = interp(y, x2, y2, x3, y3)
                xb = interp(y, x1, y1, x3, y3)
            if xa > xb:
                xa, xb = xb, xa
            for x in range(xa, xb + 1):
                self.set(x, y, c)

    def save_png(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)

        def chunk(tag: bytes, data: bytes) -> bytes:
            return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xFFFFFFFF)

        raw = bytearray()
        for y in range(self.height):
            raw.append(0)
            row = self.px[y * self.width:(y + 1) * self.width]
            for r, g, b, a in row:
                raw.extend((r, g, b, a))

        png = bytearray(b'\x89PNG\r\n\x1a\n')
        ihdr = struct.pack('!IIBBBBB', self.width, self.height, 8, 6, 0, 0, 0)
        png.extend(chunk(b'IHDR', ihdr))
        png.extend(chunk(b'IDAT', zlib.compress(bytes(raw), level=9)))
        png.extend(chunk(b'IEND', b''))
        path.write_bytes(png)


def save_player_walk():
    frame_w, frame_h, frames = 32, 32, 4
    img = Image(frame_w * frames, frame_h)

    skin = (238, 183, 142, 255)
    shirt = (35, 49, 92, 255)
    pants = (42, 83, 138, 255)
    shoes = (235, 235, 240, 255)
    cap_white = (248, 248, 248, 255)
    cap_red = (210, 55, 55, 255)
    outline = (12, 14, 26, 255)

    leg_offsets = [(-1, 2), (1, -1), (2, -2), (-2, 1)]
    arm_offsets = [(1, -1), (-1, 1), (-1, 1), (1, -1)]

    for i in range(frames):
        ox = i * frame_w
        lx, rx = leg_offsets[i]
        ax, ay = arm_offsets[i]

        img.rect(ox + 11, 6, 10, 8, cap_white)
        img.rect(ox + 11, 13, 10, 1, outline)
        img.rect(ox + 19, 11, 5, 2, cap_red)
        img.rect(ox + 13, 14, 7, 4, skin)

        img.rect(ox + 9, 18, 14, 8, shirt)
        img.rect(ox + 8 + ax, 19 + ay, 4, 7, shirt)
        img.rect(ox + 20 - ax, 19 - ay, 4, 7, shirt)
        img.rect(ox + 14, 18, 2, 8, (20, 20, 24, 255))

        img.rect(ox + 10 + lx, 26, 5, 4, pants)
        img.rect(ox + 17 + rx, 26, 5, 4, pants)

        img.rect(ox + 9 + lx, 30, 7, 2, shoes)
        img.rect(ox + 16 + rx, 30, 7, 2, shoes)

        for x in range(8, 24):
            if img.get(ox + x, 18)[3] != 0:
                img.set(ox + x, 18, outline)

    img.save_png(OUT / 'player_walk.png')


def save_clouds():
    img = Image(256, 64)
    shades = [(244, 248, 252, 255), (218, 232, 245, 255), (200, 218, 236, 255)]
    clusters = [(30, 20), (110, 14), (180, 25)]
    for cx, cy in clusters:
        for i, col in enumerate(shades):
            img.rect(cx + i * 6, cy + 4, 36 - i * 7, 12 - i * 2, col)
            img.rect(cx - 8 + i * 4, cy + 10, 20, 8, col)
            img.rect(cx + 26 - i * 4, cy + 9, 20, 8, col)
    img.save_png(OUT / 'clouds.png')


def save_trees():
    img = Image(512, 128)
    greens = [(18, 84, 43, 255), (39, 120, 58, 255), (78, 157, 72, 255)]
    trunk = (88, 58, 36, 255)

    for i, x in enumerate([80, 220, 360]):  # more sparse
        h = 48 + (i % 2) * 10
        img.rect(x, 90 - h // 3, 8, h // 2, trunk)
        img.rect(x - 20, 50, 48, 34, greens[0])
        img.rect(x - 26, 58, 60, 26, greens[1])
        img.rect(x - 16, 44, 40, 18, greens[2])

    for x in [18, 500]:
        img.rect(x, 66, 6, 30, trunk)
        img.rect(x - 10, 34, 26, 16, greens[0])
        img.rect(x - 12, 48, 30, 14, greens[1])
        img.rect(x - 8, 20, 22, 14, greens[2])

    img.save_png(OUT / 'trees_line.png')


def save_buildings():
    img = Image(1024, 256)
    palettes = [
        ((231, 198, 126, 255), (228, 134, 90, 255), (242, 222, 170, 255)),
        ((227, 186, 117, 255), (216, 109, 77, 255), (240, 212, 166, 255)),
    ]

    x = 10
    for i in range(7):
        w = 128
        h = 162 + (i % 2) * 16
        c1, c2, c3 = palettes[i % len(palettes)][0], palettes[i % len(palettes)][1], (240, 212, 166, 255)
        img.rect(x, 80 - (h - 160), w, h, c1)
        img.rect(x + 38, 80 - (h - 160), 34, h, c2)
        img.rect(x + 72, 80 - (h - 160), 56, h, c3)

        base_y = 96 - (h - 160)
        for wy in range(base_y, base_y + h - 20, 24):
            for wx in range(x + 8, x + w - 10, 20):
                img.rect(wx, wy, 10, 14, (38, 96, 164, 255))
                img.rect(wx + 1, wy + 1, 8, 5, (101, 166, 221, 255))
        x += w + 16

    img.rect(536, 95, 54, 54, (53, 92, 177, 255))
    img.triangle((563, 86), (590, 114), (536, 114), (204, 55, 55, 255))
    img.save_png(OUT / 'kalisz_blocks.png')


def save_ground_tile():
    img = Image(64, 64)
    img.rect(0, 0, 64, 64, (166, 173, 184, 255))
    for row in range(8):
        y = row * 8
        offset = 0 if row % 2 == 0 else 8
        for x in range(-offset, 64, 16):
            img.rect(x + 1, y + 1, 14, 6, (200, 206, 216, 255))
            img.rect(x + 1, y + 1, 14, 1, (230, 234, 240, 255))
            img.rect(x + 1, y + 6, 14, 1, (131, 138, 149, 255))
    img.rect(0, 0, 64, 10, (132, 140, 152, 255))
    img.save_png(OUT / 'ground_tile.png')


def save_poland_props():
    kiosk = Image(96, 64)
    kiosk.rect(8, 24, 80, 34, (214, 206, 166, 255))
    kiosk.rect(8, 24, 80, 6, (199, 58, 54, 255))
    kiosk.rect(18, 36, 22, 14, (56, 112, 170, 255))
    kiosk.rect(44, 36, 40, 14, (230, 185, 78, 255))
    kiosk.rect(30, 26, 30, 6, (28, 45, 87, 255))
    kiosk.save_png(OUT / 'kiosk_ruch.png')

    stop = Image(80, 96)
    stop.rect(36, 22, 8, 62, (95, 95, 105, 255))
    stop.rect(24, 12, 32, 20, (231, 220, 83, 255))
    stop.rect(26, 34, 28, 30, (106, 157, 211, 255))
    stop.save_png(OUT / 'bus_stop.png')

    bus = Image(192, 96)
    bus.rect(8, 30, 176, 44, (214, 85, 54, 255))
    bus.rect(8, 50, 176, 24, (237, 189, 61, 255))
    for x in range(20, 170, 26):
        bus.rect(x, 36, 18, 12, (91, 158, 216, 255))
    bus.rect(24, 70, 26, 10, (30, 30, 40, 255))
    bus.rect(138, 70, 26, 10, (30, 30, 40, 255))
    bus.save_png(OUT / 'bus_nineties.png')

    hills = Image(512, 160)
    hills.triangle((0, 140), (120, 50), (230, 140), (108, 152, 95, 255))
    hills.triangle((150, 140), (290, 30), (440, 140), (92, 141, 84, 255))
    hills.triangle((330, 140), (470, 62), (512, 140), (123, 168, 104, 255))
    hills.save_png(OUT / 'hills.png')


def save_platform_tiles():
    plat = Image(96, 48)
    plat.rect(0, 20, 96, 28, (146, 152, 162, 255))
    for x in range(0, 96, 12):
        plat.rect(x + 1, 23, 10, 8, (193, 200, 212, 255))
    plat.rect(0, 16, 96, 6, (86, 96, 112, 255))
    plat.save_png(OUT / 'platform_brick.png')


def save_contra_floor_tile():
    tile = Image(64, 64)
    # Contra-inspired tech/metal floor palette
    tile.rect(0, 0, 64, 64, (66, 72, 86, 255))
    for y in range(0, 64, 16):
        tile.rect(0, y, 64, 2, (102, 110, 128, 255))
        tile.rect(0, y + 15, 64, 1, (40, 44, 55, 255))
    for x in range(0, 64, 16):
        tile.rect(x, 0, 2, 64, (96, 102, 120, 255))
    # amber warning strips
    for x in range(4, 60, 12):
        tile.rect(x, 6, 6, 3, (228, 166, 68, 255))
        tile.rect(x, 38, 6, 3, (228, 166, 68, 255))
    # bolts
    for bx, by in [(6, 24), (22, 24), (38, 24), (54, 24), (6, 54), (22, 54), (38, 54), (54, 54)]:
        tile.rect(bx, by, 3, 3, (176, 182, 196, 255))

    tile.save_png(OUT / 'floor_contra.png')


if __name__ == '__main__':
    save_player_walk()
    save_clouds()
    save_trees()
    save_buildings()
    save_ground_tile()
    save_contra_floor_tile()
    save_poland_props()
    save_platform_tiles()
    print('Generated assets in', OUT)
