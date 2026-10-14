/**
 * Utility to extract a cropped image of a detected vehicle from the source image
 * using normalized bounding box coordinates [ymin, xmin, ymax, xmax] (0 - 1000).
 */
export async function cropVehicleFromImage(
  imageSource: string | HTMLImageElement,
  box2d: [number, number, number, number],
  paddingPercent = 0.05
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement) => {
      try {
        let [ymin, xmin, ymax, xmax] = box2d;
        // If coordinates were returned in 0-1 range instead of 0-1000, auto-scale
        if (Math.max(ymin, xmin, ymax, xmax) <= 1.0) {
          ymin *= 1000;
          xmin *= 1000;
          ymax *= 1000;
          xmax *= 1000;
        }

        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;

        // Convert 0-1000 scale to pixel coordinates
        const x1 = (xmin / 1000) * nw;
        const y1 = (ymin / 1000) * nh;
        const x2 = (xmax / 1000) * nw;
        const y2 = (ymax / 1000) * nh;

        const boxWidth = Math.max(1, x2 - x1);
        const boxHeight = Math.max(1, y2 - y1);

        // Add slight padding around vehicle for context
        const padX = boxWidth * paddingPercent;
        const padY = boxHeight * paddingPercent;

        const sx = Math.max(0, Math.floor(x1 - padX));
        const sy = Math.max(0, Math.floor(y1 - padY));
        const sw = Math.min(nw - sx, Math.ceil(boxWidth + padX * 2));
        const sh = Math.min(nh - sy, Math.ceil(boxHeight + padY * 2));

        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve('');
          return;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        console.error('Failed to crop vehicle:', err);
        resolve('');
      }
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImage(img);
      img.onerror = (err) => {
        console.error('Failed to load image for cropping', err);
        resolve('');
      };
      img.src = imageSource;
    } else {
      if (imageSource.complete) {
        processImage(imageSource);
      } else {
        imageSource.onload = () => processImage(imageSource);
        imageSource.onerror = () => resolve('');
      }
    }
  });
}
