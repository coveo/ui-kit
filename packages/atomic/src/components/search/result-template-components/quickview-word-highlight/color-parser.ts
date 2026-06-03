import {hsvToRgb, rgbToHsv} from '@/src/utils/color-utils';

/**
 * @internal
 */
export class ColorParser {
  private static readonly REGEX =
    /\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i;

  private red: number = 255;
  private green: number = 255;
  private blue: number = 255;

  constructor(private color: string) {
    const rgb = this.color.match(ColorParser.REGEX);
    if (rgb) {
      this.red = parseInt(rgb[1], 10);
      this.green = parseInt(rgb[2], 10);
      this.blue = parseInt(rgb[3], 10);
    }
  }

  public rgb(): string {
    return this.rgbString(this.red, this.green, this.blue);
  }

  public rgbInverted(): string {
    return this.rgbString(255 - this.red, 255 - this.green, 255 - this.blue);
  }

  public rgbSaturated(): string {
    const {h, s, v} = rgbToHsv(this.red, this.green, this.blue);
    let newSaturation = s * 2;
    if (newSaturation > 1) {
      newSaturation = 1;
    }
    const {r, g, b} = hsvToRgb(h, newSaturation, v);
    return this.rgbString(r, g, b);
  }

  private rgbString(r: number, g: number, b: number): string {
    return `rgb(${r}, ${g}, ${b})`;
  }
}
