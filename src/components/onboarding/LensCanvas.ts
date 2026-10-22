import { render, setup } from './LensEffect';

const WIDTH = 544;
const HEIGHT = 306;
const PARAMS = {
  chromaticMode: 0,
  distortionStrength: 0.429999977350235,
  aberrationStrength: 0.1899999976158142,
  centre: { x: 50, y: 50 },
  quality: 0,
};

type LensMedia = HTMLVideoElement | HTMLImageElement;

/** Minimal WebGPU texture adapter for the source rectangles used by onboarding. */
export async function startLensCanvas(
  canvas: HTMLCanvasElement,
  media: LensMedia,
): Promise<() => void> {
  if (!navigator.gpu) throw new Error('WebGPU is unavailable');

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No WebGPU adapter is available');
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) throw new Error('WebGPU canvas context is unavailable');

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'premultiplied' });

  const staged = document.createElement('canvas');
  staged.width = WIDTH;
  staged.height = HEIGHT;
  const stagedContext = staged.getContext('2d', { alpha: true });
  if (!stagedContext) throw new Error('2D staging canvas is unavailable');

  const texture = device.createTexture({
    size: [WIDTH, HEIGHT, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  const frame: any = {
    state: {},
    params: PARAMS,
    output: null,
    input: texture,
    time: 0,
  };
  setup(device, frame);

  const draw = (time: number) => {
    const sourceWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const sourceHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
    if (!sourceWidth || !sourceHeight) {
      frame.raf = requestAnimationFrame(draw);
      return;
    }

    // Figma marks these rectangles FILL: crop the source to the 16:9 card before sampling.
    const scale = Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight);
    const cropWidth = WIDTH / scale;
    const cropHeight = HEIGHT / scale;
    const sx = (sourceWidth - cropWidth) / 2;
    const sy = (sourceHeight - cropHeight) / 2;
    stagedContext.clearRect(0, 0, WIDTH, HEIGHT);
    stagedContext.drawImage(media, sx, sy, cropWidth, cropHeight, 0, 0, WIDTH, HEIGHT);
    device.queue.copyExternalImageToTexture(
      { source: staged },
      { texture, premultipliedAlpha: true },
      [WIDTH, HEIGHT],
    );

    const output = context.getCurrentTexture();
    frame.time = time / 1000;
    frame.output = {
      createView: () => output.createView(),
      format,
      width: WIDTH,
      height: HEIGHT,
    };
    render(device, frame);
    if (media instanceof HTMLVideoElement) frame.raf = requestAnimationFrame(draw);
  };

  frame.raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame.raf);
    texture.destroy();
    frame.state.quad?.destroy();
    frame.state.uniformBuf?.destroy();
    frame.state.placeholder?.destroy();
    device.destroy();
    context.unconfigure();
  };
}
