import { useEffect, useRef, useState } from 'react';
import { asset } from '../../lib/assets';
import './InteractivePortrait.css';

type InteractivePortraitProps = {
  alt: string;
  playbackEnabled?: boolean;
  className?: string;
};

const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform sampler2D u_photo;
uniform vec2 u_cropOffset;
uniform vec2 u_cropSize;
uniform vec2 u_gaze;
uniform float u_blink;
in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 photoUv = u_cropOffset + v_uv * u_cropSize;
  vec2 sourcePx = photoUv * vec2(1024.0, 1016.0);
  vec2 delta = sourcePx - vec2(773.0, 451.0);

  const float axisAngle = -0.22;
  float c = cos(axisAngle);
  float s = sin(axisAngle);
  vec2 local = vec2(c * delta.x + s * delta.y, -s * delta.x + c * delta.y);
  float xWeight = 1.0 - smoothstep(0.65, 1.0, abs(local.x) / 78.0);
  float innerY = 23.0 * sqrt(max(0.0, 1.0 - (local.x / 78.0) * (local.x / 78.0)));
  float openness = 1.0 - 0.96 * u_blink * xWeight;
  float compressedY = innerY * openness;
  float absY = abs(local.y);
  float mappedAbsY = absY <= compressedY
    ? absY / max(openness, 0.04)
    : innerY + (absY - compressedY) * (62.0 - innerY) / max(62.0 - compressedY, 0.001);
  float roiY = 1.0 - smoothstep(56.0, 62.0, absY);
  float warpedY = sign(local.y) * mix(absY, mappedAbsY, roiY);

  float irisRadius = length(vec2(local.x / 55.0, local.y / 28.0));
  float irisMask = 1.0 - smoothstep(0.75, 1.0, irisRadius);
  float gazeStrength = irisMask * (1.0 - u_blink);
  float sampleX = local.x - u_gaze.x * 13.0 * gazeStrength;
  float sampleY = warpedY - u_gaze.y * 6.0 * gazeStrength;
  vec2 sampleDelta = vec2(c * sampleX - s * sampleY, s * sampleX + c * sampleY);
  vec2 sampleUv = (vec2(773.0, 451.0) + sampleDelta) / vec2(1024.0, 1016.0);

  // Shader coordinates use a top-left origin; the upload is flipped once for WebGL's texture origin.
  outColor = texture(u_photo, vec2(sampleUv.x, 1.0 - sampleUv.y));
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function InteractivePortrait({ alt, playbackEnabled = true, className = '' }: InteractivePortraitProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(query.matches);
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !image || !canvas) return;

    const setRenderer = (renderer: 'static' | 'webgl') => {
      wrapper.dataset.portraitRenderer = renderer;
      if (renderer === 'static') {
        wrapper.dataset.gazeX = '0';
        wrapper.dataset.gazeY = '0';
        wrapper.dataset.blink = '0';
      }
    };
    setRenderer('static');
    if (!playbackEnabled || reducedMotion || !imageReady || image.naturalWidth === 0) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false });
    } catch {
      return;
    }
    if (!gl) return;

    const program = createProgram(gl);
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!program || !buffer || !texture) {
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      if (texture) gl.deleteTexture(texture);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const uvLocation = gl.getAttribLocation(program, 'a_uv');
    const cropOffsetLocation = gl.getUniformLocation(program, 'u_cropOffset');
    const cropSizeLocation = gl.getUniformLocation(program, 'u_cropSize');
    const gazeLocation = gl.getUniformLocation(program, 'u_gaze');
    const blinkLocation = gl.getUniformLocation(program, 'u_blink');
    const photoLocation = gl.getUniformLocation(program, 'u_photo');
    if (positionLocation < 0 || uvLocation < 0 || !cropOffsetLocation || !cropSizeLocation || !gazeLocation || !blinkLocation || !photoLocation) {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      return;
    }

    const vertices = new Float32Array([
      -1, 1, 0, 0,
      1, 1, 1, 0,
      -1, -1, 0, 1,
      1, -1, 1, 1,
    ]);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    } catch {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      return;
    }
    gl.uniform1i(photoLocation, 0);

    const coarsePointer = window.matchMedia('(pointer: coarse), (hover: none)').matches;
    let disposed = false;
    let contextLost = false;
    let inViewport = true;
    let raf = 0;
    let blinkTimer = 0;
    let idleTimer = 0;
    let blinkStartedAt = 0;
    let currentGazeX = 0;
    let currentGazeY = 0;
    let targetGazeX = 0;
    let targetGazeY = 0;
    let currentBlink = 0;
    let lastFrame = 0;

    const updateDiagnostics = () => {
      wrapper.dataset.gazeX = currentGazeX.toFixed(2);
      wrapper.dataset.gazeY = currentGazeY.toFixed(2);
      wrapper.dataset.blink = currentBlink.toFixed(2);
    };

    const resize = () => {
      if (!gl || contextLost) return;
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      const viewAspect = rect.width / Math.max(rect.height, 1);
      const imageAspect = 1024 / 1016;
      let offsetX = 0;
      let offsetY = 0;
      let visibleWidth = 1;
      let visibleHeight = 1;
      if (imageAspect > viewAspect) {
        visibleWidth = viewAspect / imageAspect;
        offsetX = (1 - visibleWidth) / 2;
      } else {
        visibleHeight = imageAspect / viewAspect;
        offsetY = (1 - visibleHeight) / 2;
      }
      gl.useProgram(program);
      gl.uniform2f(cropOffsetLocation, offsetX, offsetY);
      gl.uniform2f(cropSizeLocation, visibleWidth, visibleHeight);
      draw();
    };

    const blinkValueAt = (now: number) => {
      if (!blinkStartedAt) return 0;
      const elapsed = now - blinkStartedAt;
      const smooth = (value: number) => value * value * (3 - 2 * value);
      if (elapsed < 70) return smooth(Math.max(0, elapsed / 70));
      if (elapsed < 100) return 1;
      if (elapsed < 210) return 1 - smooth((elapsed - 100) / 110);
      blinkStartedAt = 0;
      return 0;
    };

    const draw = () => {
      if (!gl || contextLost || disposed) return;
      gl.useProgram(program);
      gl.uniform2f(gazeLocation, currentGazeX, currentGazeY);
      gl.uniform1f(blinkLocation, currentBlink);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      setRenderer('webgl');
      updateDiagnostics();
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || contextLost || document.hidden || !inViewport) return;
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.08) : 1 / 60;
      lastFrame = now;
      const alpha = 1 - Math.exp(-dt / 0.12);
      currentGazeX += (targetGazeX - currentGazeX) * alpha;
      currentGazeY += (targetGazeY - currentGazeY) * alpha;
      currentBlink = blinkValueAt(now);
      draw();

      const gazeMoving = Math.abs(targetGazeX - currentGazeX) > 0.002 || Math.abs(targetGazeY - currentGazeY) > 0.002;
      const blinking = currentBlink > 0 || blinkStartedAt !== 0;
      if (gazeMoving || blinking) raf = window.requestAnimationFrame(frame);
      else lastFrame = 0;
    };

    const ensureFrame = () => {
      if (!raf && !disposed && !contextLost && !document.hidden && inViewport) raf = window.requestAnimationFrame(frame);
    };

    const cancelMotion = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(blinkTimer);
      window.clearTimeout(idleTimer);
      blinkTimer = 0;
      idleTimer = 0;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      targetGazeX = 0;
      targetGazeY = 0;
      blinkStartedAt = 0;
      currentBlink = 0;
      lastFrame = 0;
    };

    const scheduleIdle = () => {
      if (!coarsePointer || disposed || document.hidden || !inViewport || contextLost) return;
      idleTimer = window.setTimeout(() => {
        targetGazeX = randomBetween(-0.45, 0.45);
        targetGazeY = randomBetween(-0.15, 0.15);
        ensureFrame();
        scheduleIdle();
      }, randomBetween(4000, 7000));
    };

    const scheduleBlink = (initial = false) => {
      if (disposed || document.hidden || !inViewport || contextLost) return;
      blinkTimer = window.setTimeout(() => {
        blinkStartedAt = performance.now();
        ensureFrame();
        blinkTimer = window.setTimeout(() => scheduleBlink(), 210);
      }, initial ? randomBetween(2500, 4000) : randomBetween(4000, 7000));
    };

    function eyeClientPosition() {
      const rect = wrapper!.getBoundingClientRect();
      const imageAspect = 1024 / 1016;
      const boxAspect = rect.width / Math.max(rect.height, 1);
      const scale = Math.max(rect.width / 1024, rect.height / 1016);
      const cropX = imageAspect > boxAspect ? (1024 - rect.width / scale) / 2 : 0;
      const cropY = imageAspect > boxAspect ? 0 : (1016 - rect.height / scale) / 2;
      return {
        x: rect.left + (773 - cropX) * scale,
        y: rect.top + (451 - cropY) * scale,
      };
    }

    function onPointerMove(event: PointerEvent) {
      if (coarsePointer || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      const eye = eyeClientPosition();
      targetGazeX = Math.max(-1, Math.min(1, (event.clientX - eye.x) / Math.max(120, window.innerWidth * 0.35)));
      targetGazeY = Math.max(-1, Math.min(1, (event.clientY - eye.y) / Math.max(120, window.innerHeight * 0.5)));
      ensureFrame();
    }

    function onPointerOut(event: PointerEvent) {
      if (event.relatedTarget === null) {
        targetGazeX = 0;
        targetGazeY = 0;
        ensureFrame();
      }
    }

    const startMotion = () => {
      if (disposed || contextLost || document.hidden || !inViewport) return;
      cancelMotion();
      if (!coarsePointer) {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerout', onPointerOut, { passive: true });
      } else {
        scheduleIdle();
      }
      scheduleBlink(true);
      ensureFrame();
    };

    const onVisibilityChange = () => {
      if (document.hidden) cancelMotion();
      else startMotion();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelMotion();
      setRenderer('static');
    };

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
        inViewport = entries[0]?.isIntersecting ?? false;
        if (inViewport) startMotion();
        else cancelMotion();
      }, { threshold: 0.01 })
      : null;
    observer?.observe(wrapper);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrapper);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    canvas.addEventListener('webglcontextlost', onContextLost);
    resize();
    if (!document.hidden) startMotion();

    return () => {
      disposed = true;
      cancelMotion();
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl?.deleteTexture(texture);
      gl?.deleteBuffer(buffer);
      gl?.deleteProgram(program);
      if (!canvas.isConnected) gl?.getExtension('WEBGL_lose_context')?.loseContext();
      setRenderer('static');
    };
  }, [imageReady, playbackEnabled, reducedMotion]);

  const imagePath = asset('figma/f29c3.png');
  return <span ref={wrapperRef} className={`interactive-portrait ${className}`.trim()} role="img" aria-label={alt} data-portrait-renderer="static" data-gaze-x="0" data-gaze-y="0" data-blink="0">
    <img ref={imageRef} src={imagePath} alt="" aria-hidden="true" draggable={false} onLoad={() => setImageReady(true)} />
    <canvas ref={canvasRef} aria-hidden="true" />
  </span>;
}
