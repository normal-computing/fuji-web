// TODO: make it configurable?
const DEFAULT_FONT_SIZE = 30;
const DEFAULT_FONT_STYLE = `${DEFAULT_FONT_SIZE}px serif`;

export type ImageSourceAttrs = {
  src: string;
  caption?: string;
  opacity?: number | undefined;
};

type ExtendedImageData = ImageSourceAttrs & {
  img: HTMLImageElement;
};

export type MergeImageOptionsInput = {
  format?: string;
  quality?: number;
  width?: number;
  height?: number;
  padding?: number;
};

type MergeImageOptions = MergeImageOptionsInput & {
  format: string;
  padding: number;
};

export type GetCanvasSize = (
  images: ExtendedImageData[],
  options: MergeImageOptions,
) => {
  width: number;
  height: number;
};

// if not specified, use horizontal layout
const getHorizontalLayoutCanvasSize: GetCanvasSize = (images, options) => {
  let width = 0;
  let height = 0;
  images.forEach((image) => {
    const padding = options.padding || 0;
    width += image.img.width + padding * 2;
    height = Math.max(height, image.img.height + padding * 2);
  });
  return {
    width,
    height: height + DEFAULT_FONT_SIZE,
  };
};

// Defaults
const defaultOptions: MergeImageOptions = {
  format: "image/png",
  quality: 0.92,
  padding: 10,
};

const mergeImages = async (
  sources: ImageSourceAttrs[] = [],
  optionsInput: MergeImageOptionsInput = {},
) => {
  const options: MergeImageOptions = Object.assign(
    {},
    defaultOptions,
    optionsInput,
  );

  // Setup browser/Node.js specific variables
  const canvas = window.document.createElement("canvas");

  // Load sources
  const images: Promise<ExtendedImageData>[] = sources.map(
    (source) =>
      new Promise((resolve, reject) => {
        // Resolve source and img when loaded
        const img = new Image();
        img.onerror = () => reject(new Error("Couldn't load image"));
        const data = {
          ...source,
          img,
        };
        img.onload = () => resolve(data);
        img.src = source.src;
      }),
  );

  // Get canvas context
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // When sources have loaded
  return await Promise.all(images).then((images) => {
    // Set canvas dimensions
    const canvasSize = getHorizontalLayoutCanvasSize(images, options);
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Draw images and captions to canvas (horizontally)
    let x = options.padding;
    const y = options.padding;
    ctx.textAlign = "center";
    ctx.font = DEFAULT_FONT_STYLE;
    images.forEach((image) => {
      ctx.globalAlpha = image.opacity ? image.opacity : 1;
      ctx.drawImage(image.img, x, y);
      if (image.caption != null) {
        ctx.fillText(
          image.caption,
          x + image.img.width / 2,
          y + image.img.height + DEFAULT_FONT_SIZE,
        );
      }
      // Increment x to where the next image should be drawn
      x += image.img.width + options.padding;
    });

    return canvas.toDataURL(options.format, options.quality);
  });
};

export default mergeImages;
