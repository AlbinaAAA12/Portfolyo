import { render, setup } from './LensEffect';

const WIDTH = 544;
const HEIGHT = 306;
const RADIUS = 13 * (WIDTH / 113.042);
const PARAMS = {
  chromaticMode: 0,
  distortionStrength: 0.429999977350235,
  aberrationStrength: 0.1899999976158142,
  centre: { x: 50, y: 50 },
  quality: 0,
};

type LensMedia = HTMLVideoElement | HTMLImageElement;
type Cleanup = () => void;

const JITTER: readonly [number, number][] = [
  [0, 0], [0.5, -0.333333], [-0.25, 0.333333], [0.25, -0.111111],
];
const KERNEL_TAPS = 48;
const INV_KERNEL_SIZE = 1 / (KERNEL_TAPS - 1);
let KERNEL_WEIGHT_SUM = 0;
for (let i = 0; i < KERNEL_TAPS; i += 1) {
  const fi = i * INV_KERNEL_SIZE - 0.5;
  KERNEL_WEIGHT_SUM += 1 - Math.abs(fi * 2);
}

function sourceSize(media: LensMedia): [number, number] {
  return media instanceof HTMLVideoElement
    ? [media.videoWidth, media.videoHeight]
    : [media.naturalWidth, media.naturalHeight];
}

/** Figma's 113.042 × 63.639 card has a 13px corner radius. */
function stageSource(media: LensMedia, context: CanvasRenderingContext2D): boolean {
  const [sourceWidth, sourceHeight] = sourceSize(media);
  if (!sourceWidth || !sourceHeight) return false;

  const scale = Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight);
  const cropWidth = WIDTH / scale;
  const cropHeight = HEIGHT / scale;
  const sx = (sourceWidth - cropWidth) / 2;
  const sy = (sourceHeight - cropHeight) / 2;

  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.save();
  context.beginPath();
  context.roundRect(0, 0, WIDTH, HEIGHT, RADIUS);
  context.clip();
  context.drawImage(media, sx, sy, cropWidth, cropHeight, 0, 0, WIDTH, HEIGHT);
  context.restore();
  return true;
}

function replaceCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const replacement = document.createElement('canvas');
  replacement.className = canvas.className;
  replacement.setAttribute('aria-hidden', canvas.getAttribute('aria-hidden') ?? 'true');
  replacement.dataset.lensRenderer = 'webgl2';
  canvas.replaceWith(replacement);
  return replacement;
}

async function startWebGpu(canvas: HTMLCanvasElement, media: LensMedia, onReady: () => void): Promise<Cleanup> {
  const gpu = navigator.gpu;
  if (!gpu) throw new Error('WebGPU unavailable');
  const adapter = await gpu.requestAdapter();
  if (!adapter) throw new Error('WebGPU adapter unavailable');
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) {
    device.destroy();
    throw new Error('WebGPU context unavailable');
  }

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const format = gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'premultiplied' });

  const staged = document.createElement('canvas');
  staged.width = WIDTH;
  staged.height = HEIGHT;
  const stagedContext = staged.getContext('2d', { alpha: true });
  if (!stagedContext) throw new Error('2D staging canvas unavailable');

  const texture = device.createTexture({
    size: [WIDTH, HEIGHT, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING
      | GPUTextureUsage.COPY_DST
      | GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const frame: any = { state: {}, params: PARAMS, output: null, input: texture, time: 0 };
  setup(device, frame);
  canvas.dataset.lensRenderer = 'webgpu';
  let active = true;
  let gpuFailed = false;
  let raf = 0;
  let firstFrameSettled = false;
  let resolveFirstFrame!: () => void;
  let rejectFirstFrame!: (reason: Error) => void;
  const firstFrame = new Promise<void>((resolve, reject) => {
    resolveFirstFrame = resolve;
    rejectFirstFrame = reject;
  });
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    active = false;
    cancelAnimationFrame(raf);
    device.removeEventListener('uncapturederror', onUncapturedError);
    texture.destroy();
    frame.state.quad?.destroy();
    frame.state.uniformBuf?.destroy();
    frame.state.placeholder?.destroy();
    device.destroy();
    context.unconfigure();
  };
  const failFirstFrame = (reason: Error) => {
    if (firstFrameSettled) return;
    firstFrameSettled = true;
    cleanup();
    rejectFirstFrame(reason);
  };
  const onUncapturedError = () => {
    gpuFailed = true;
    delete canvas.dataset.lensReady;
    failFirstFrame(new Error('WebGPU validation error before first frame'));
  };
  device.addEventListener('uncapturederror', onUncapturedError);
  const draw = (time: number) => {
    if (!active) return;
    try {
      if (!stageSource(media, stagedContext)) throw new Error('Lens media has no drawable frame');
      const validatingFirstFrame = !firstFrameSettled;
      if (validatingFirstFrame) device.pushErrorScope('validation');
      device.queue.copyExternalImageToTexture(
        { source: staged }, { texture, premultipliedAlpha: true }, [WIDTH, HEIGHT],
      );
      const output = context.getCurrentTexture();
      frame.time = time / 1000;
      frame.output = { createView: () => output.createView(), format, width: WIDTH, height: HEIGHT };
      render(device, frame);
      if (validatingFirstFrame) {
        void device.popErrorScope().then((validationError) => {
          if (validationError) throw new Error(validationError.message);
          return device.queue.onSubmittedWorkDone();
        }).then(() => {
          if (!active || gpuFailed || firstFrameSettled) return;
          firstFrameSettled = true;
          canvas.dataset.lensReady = 'true';
          onReady();
          resolveFirstFrame();
          if (media instanceof HTMLVideoElement && !media.paused && !media.ended) {
            raf = requestAnimationFrame(draw);
          }
        }).catch((error: unknown) => {
          gpuFailed = true;
          failFirstFrame(error instanceof Error ? error : new Error('WebGPU submission failed'));
        });
      } else {
        void device.queue.onSubmittedWorkDone().catch(() => {});
        if (media instanceof HTMLVideoElement && !media.paused && !media.ended) {
          raf = requestAnimationFrame(draw);
        }
      }
    } catch (error) {
      failFirstFrame(error instanceof Error ? error : new Error('WebGPU render failed'));
    }
  };
  raf = requestAnimationFrame(draw);
  void device.lost.then((info) => {
    if (!firstFrameSettled) failFirstFrame(new Error(`WebGPU device lost: ${info.message}`));
  });
  await firstFrame;
  return cleanup;
}

const VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = p * 0.5;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D inputTex;
in vec2 uv;
out vec4 fragColor;
const float W = ${WIDTH.toFixed(1)};
const float H = ${HEIGHT.toFixed(1)};
const float RADIUS = ${RADIUS.toFixed(8)};
const float AMOUNT = 0.429999977350235;
const float CHROMA = (1.0 + abs(AMOUNT)) * 0.1899999976158142;
const float INV_KERNEL_SIZE = ${INV_KERNEL_SIZE.toFixed(12)};
const float KERNEL_WEIGHT_SUM = ${KERNEL_WEIGHT_SUM.toFixed(12)};
vec4 sampleZero(vec2 p) {
  vec2 q = p / vec2(W, H);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return vec4(0.0);
  return texture(inputTex, q);
}
vec2 lensDistort(vec2 p, float amount) {
  vec2 centered = p - vec2(W, H) * 0.5;
  float norm2 = dot(centered / ${Math.hypot(WIDTH, HEIGHT).toFixed(8)} * 2.0,
                    centered / ${Math.hypot(WIDTH, HEIGHT).toFixed(8)} * 2.0);
  float distortion = 1.0 + amount * (norm2 + norm2 * norm2);
  return centered * distortion + vec2(W, H) * 0.5;
}
vec4 distorted(vec2 p, float amount) { return sampleZero(lensDistort(p, amount)); }
void main() {
  vec2 localPos = vec2(gl_FragCoord.x, H - gl_FragCoord.y);
  const vec2 jitter[4] = vec2[4](
    ${JITTER.map(([x, y]) => `vec2(${x.toFixed(6)}, ${y.toFixed(6)})`).join(',\n    ')});
  vec4 accumColor = vec4(0.0);
  for (int j = 0; j < 4; ++j) {
    vec2 tapPos = localPos + jitter[j] * 1.4;
    vec4 tapColor = vec4(0.0);
    for (int i = 0; i < 48; ++i) {
      float fi = float(i) * INV_KERNEL_SIZE - 0.5;
      float window = 1.0 - abs(fi * 2.0);
      vec4 redSample = distorted(tapPos, AMOUNT + (fi + 0.5) * CHROMA);
      vec4 greenSample = distorted(tapPos, AMOUNT + fi * CHROMA);
      vec4 blueSample = distorted(tapPos, AMOUNT + (fi - 0.5) * CHROMA);
      float r = redSample.a > 0.01 ? redSample.r / max(0.001, redSample.a) : 1.0;
      float g = greenSample.a > 0.01 ? greenSample.g / max(0.001, greenSample.a) : 1.0;
      float b = blueSample.a > 0.01 ? blueSample.b / max(0.001, blueSample.a) : 1.0;
      float alpha = max(max(redSample.a, greenSample.a), blueSample.a);
      tapColor += vec4(r * alpha, g * alpha, b * alpha, alpha) * window;
    }
    tapColor /= max(KERNEL_WEIGHT_SUM, 0.0001);
    accumColor += tapColor;
  }
  fragColor = accumColor / 4.0;
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'WebGL shader compilation failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function startWebGl(canvas: HTMLCanvasElement, media: LensMedia, onReady: () => void): Cleanup {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 unavailable');
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create WebGL program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'WebGL link failed');
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  const staged = document.createElement('canvas');
  staged.width = WIDTH;
  staged.height = HEIGHT;
  const stagedContext = staged.getContext('2d', { alpha: true });
  if (!stagedContext) throw new Error('2D staging canvas unavailable');
  const texture = gl.createTexture();
  if (!texture) throw new Error('Unable to create WebGL texture');
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.useProgram(program);
  gl.uniform1i(gl.getUniformLocation(program, 'inputTex'), 0);
  canvas.dataset.lensRenderer = 'webgl2';
  let active = true;
  let raf = 0;
  let readySent = false;
  const draw = () => {
    if (!active) return;
    if (stageSource(media, stagedContext)) {
      gl.viewport(0, 0, WIDTH, HEIGHT);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, staged);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!readySent && gl.getError() === gl.NO_ERROR) {
        readySent = true;
        canvas.dataset.lensReady = 'true';
        onReady();
      }
    }
    if (media instanceof HTMLVideoElement && !media.paused && !media.ended) raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => {
    active = false;
    cancelAnimationFrame(raf);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

/** Use WebGPU first and the mathematically equivalent lateral GLSL pass on WebGL2. */
export async function startLensCanvas(canvas: HTMLCanvasElement, media: LensMedia, onReady: () => void): Promise<Cleanup> {
  try {
    return await startWebGpu(canvas, media, onReady);
  } catch {
    // A canvas cannot change context type after a failed WebGPU context creation.
    const fallbackCanvas = replaceCanvas(canvas);
    try {
      return startWebGl(fallbackCanvas, media, onReady);
    } catch (error) {
      fallbackCanvas.dataset.lensRenderer = 'unavailable';
      throw error;
    }
  }
}
