from pathlib import Path
try:
    from PIL import Image, ImageDraw
except ModuleNotFoundError as exc:
    raise SystemExit('Pillow is required for PNG export. Install with: pip install pillow') from exc

OUT = Path('assets/generated')
OUT.mkdir(parents=True, exist_ok=True)


def px_rect(draw, x, y, w, h, c):
    draw.rectangle((x, y, x + w - 1, y + h - 1), fill=c)


def save_player_walk():
    frame_w, frame_h, frames = 32, 32, 4
    img = Image.new('RGBA', (frame_w * frames, frame_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

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

        # head/cap
        px_rect(d, ox + 11, 6, 10, 8, cap_white)
        px_rect(d, ox + 11, 13, 10, 1, outline)
        px_rect(d, ox + 19, 11, 5, 2, cap_red)
        px_rect(d, ox + 13, 14, 7, 4, skin)

        # torso (baggy hoodie)
        px_rect(d, ox + 9, 18, 14, 8, shirt)
        px_rect(d, ox + 8 + ax, 19 + ay, 4, 7, shirt)
        px_rect(d, ox + 20 - ax, 19 - ay, 4, 7, shirt)

        # strap / chest detail
        px_rect(d, ox + 14, 18, 2, 8, (20, 20, 24, 255))

        # pants (baggy)
        px_rect(d, ox + 10 + lx, 26, 5, 4, pants)
        px_rect(d, ox + 17 + rx, 26, 5, 4, pants)

        # big skate shoes
        px_rect(d, ox + 9 + lx, 30, 7, 2, shoes)
        px_rect(d, ox + 16 + rx, 30, 7, 2, shoes)

        # outlines for chunky pixel look
        for x in range(8, 24):
            if img.getpixel((ox + x, 18))[3] != 0:
                img.putpixel((ox + x, 18), outline)
        for x in range(10, 23):
            if img.getpixel((ox + x, 31))[3] != 0:
                img.putpixel((ox + x, 31), outline)

    img.save(OUT / 'player_walk.png')


def save_clouds():
    img = Image.new('RGBA', (256, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    shades = [(244, 248, 252, 180), (218, 232, 245, 160), (200, 218, 236, 150)]

    clusters = [(30, 20), (110, 14), (180, 25)]
    for cx, cy in clusters:
        for i, col in enumerate(shades):
            px_rect(d, cx + i * 6, cy + 4, 36 - i * 7, 12 - i * 2, col)
            px_rect(d, cx - 8 + i * 4, cy + 10, 20, 8, col)
            px_rect(d, cx + 26 - i * 4, cy + 9, 20, 8, col)

    img.save(OUT / 'clouds.png')


def save_trees():
    img = Image.new('RGBA', (512, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    greens = [(18, 84, 43, 255), (39, 120, 58, 255), (78, 157, 72, 255)]
    trunk = (88, 58, 36, 255)

    for i, x in enumerate([40, 140, 240, 340, 440]):
        h = 44 + (i % 2) * 10
        px_rect(d, x, 90 - h // 3, 8, h // 2, trunk)
        px_rect(d, x - 20, 50, 48, 34, greens[0])
        px_rect(d, x - 26, 58, 60, 26, greens[1])
        px_rect(d, x - 16, 44, 40, 18, greens[2])

    # pines for 8-bit variety
    for x in [8, 500]:
        px_rect(d, x, 66, 6, 30, trunk)
        px_rect(d, x - 10, 34, 26, 16, greens[0])
        px_rect(d, x - 12, 48, 30, 14, greens[1])
        px_rect(d, x - 8, 20, 22, 14, greens[2])

    img.save(OUT / 'trees_line.png')


def save_buildings():
    img = Image.new('RGBA', (1024, 256), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    palettes = [
        ((231, 198, 126, 255), (228, 134, 90, 255), (242, 222, 170, 255)),
        ((227, 186, 117, 255), (216, 109, 77, 255), (240, 212, 166, 255)),
        ((235, 195, 129, 255), (229, 145, 99, 255), (244, 228, 189, 255)),
    ]

    x = 10
    for i in range(7):
        w = 128
        h = 162 + (i % 2) * 16
        c1, c2, c3 = palettes[i % len(palettes)]

        px_rect(d, x, 80 - (h - 160), w, h, c1)
        px_rect(d, x + 38, 80 - (h - 160), 34, h, c2)
        px_rect(d, x + 72, 80 - (h - 160), 56, h, c3)

        # windows
        base_y = 96 - (h - 160)
        for wy in range(base_y, base_y + h - 20, 24):
            for wx in range(x + 8, x + w - 10, 20):
                px_rect(d, wx, wy, 10, 14, (38, 96, 164, 255))
                px_rect(d, wx + 1, wy + 1, 8, 5, (101, 166, 221, 255))

        # balconies
        for by in range(base_y + 6, base_y + h - 30, 24):
            px_rect(d, x + 38, by + 14, 33, 4, (124, 62, 42, 255))

        # rooftop details
        px_rect(d, x + 20, 74 - (h - 160), 8, 6, (40, 40, 54, 255))
        px_rect(d, x + 80, 70 - (h - 160), 7, 10, (32, 32, 46, 255))

        x += w + 16

    # Atlas-like emblem on one block
    px_rect(d, 536, 95, 54, 54, (53, 92, 177, 255))
    d.polygon([(563, 86), (590, 114), (563, 142), (536, 114)], fill=(204, 55, 55, 255))

    img.save(OUT / 'kalisz_blocks.png')


def save_ground_tile():
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # dirt
    px_rect(d, 0, 0, 64, 64, (92, 71, 39, 255))
    for y in range(0, 64, 8):
        for x in range((y // 8) % 2 * 4, 64, 8):
            px_rect(d, x, y, 4, 4, (110, 85, 48, 255))

    # grass top
    px_rect(d, 0, 0, 64, 12, (64, 132, 59, 255))
    for x in range(0, 64, 4):
        px_rect(d, x, 0, 2, 6 + (x % 3), (77, 154, 69, 255))

    img.save(OUT / 'ground_tile.png')


if __name__ == '__main__':
    save_player_walk()
    save_clouds()
    save_trees()
    save_buildings()
    save_ground_tile()
    print('Generated assets in', OUT)
