'use client';

/**
 * Nova AI Orb — ambient background inspired by the classic
 * "Artificial Intelligence / Visual effect motion" aesthetic:
 * a glowing plasma sphere (deep navy, royal blue, cyan, magenta)
 * with an ice-white rim, soft halo and breathing energy rings.
 *
 * Rendered with WebGL through the in-house ReactShaderToy and blended
 * with `mix-blend-screen` over the obsidian JarvisBackground, so if
 * WebGL is unavailable the canvas simply disappears and the CSS
 * background remains untouched.
 *
 * The orb is voice-reactive: it listens to the agent's audio track
 * volume and brightens/pulses as Nova speaks.
 */
import { useMemo } from 'react';
import { useTrackVolume, useVoiceAssistant } from '@livekit/components-react';
import { ReactShaderToy } from '@/components/agents-ui/react-shader-toy';

const AI_ORB_SHADER = `
// ------------------------------------------------------------------
// Nova AI Orb — palette lifted from the reference motion piece:
//   #020108 (void)  #0E0F5D (deep navy)  #162396 (blue)
//   #3155D3 (royal) #4ECFF4 (cyan)       #CDE7FD (ice)
//   #BA10F6 (magenta)
// ------------------------------------------------------------------
const vec3 C_DEEP  = vec3(0.086, 0.137, 0.588);
const vec3 C_ROYAL = vec3(0.192, 0.333, 0.827);
const vec3 C_CYAN  = vec3(0.306, 0.812, 0.957);
const vec3 C_MAG   = vec3(0.729, 0.063, 0.965);
const vec3 C_ICE   = vec3(0.804, 0.906, 0.992);

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p = p * 2.03 + vec2(13.7, 7.1);
    amp *= 0.55;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // centred, aspect-safe coordinates
  vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
  float t = iTime * 0.30;
  float audio = clamp(iAudio, 0.0, 1.0);

  float r = length(uv);
  float ang = atan(uv.y, uv.x);

  // breathing radius + voice pulse
  float R = 0.58 + 0.015 * sin(iTime * 0.8) + audio * 0.06;

  // swirled interior coordinates (plasma flow)
  float swirl = fbm(uv * 2.1 + vec2(t * 0.7, -t * 0.45));
  float rot = ang + swirl * 2.4 + t * 0.55;
  vec2 suv = vec2(cos(rot), sin(rot)) * r;

  float n1 = fbm(suv * 3.0 + vec2(t, -t * 0.7));
  float n2 = fbm(suv * 5.5 - vec2(t * 0.8, t * 0.4));

  // big soft colour blobs, like the reference frames
  float band = 0.5 + 0.5 * sin(rot * 2.0 + n1 * 4.0 + t * 0.8);

  vec3 body = mix(C_DEEP * 0.55, C_ROYAL, smoothstep(0.25, 0.75, n1));
  body = mix(body, C_CYAN, smoothstep(0.55, 0.95, n2 * band + audio * 0.12));

  // magenta energy swirl, drifting around the sphere
  float magMask = (1.0 - smoothstep(0.0, 0.35, abs(sin(rot + n1 * 1.5 - 0.9))))
                * smoothstep(0.40, 0.72, n2);
  body = mix(body, C_MAG, magMask * 0.85);

  // cheap sphere shading: darker crown, brighter belly
  body *= 0.72 + 0.48 * smoothstep(-0.65, 0.65, uv.y * 0.6 + n2 * 0.4);

  // interior mask + bright uneven rim
  float inner = 1.0 - smoothstep(R - 0.055, R + 0.012, r);
  float rim = exp(-abs(r - R) * 30.0);
  float rimWobble = 0.85 + 0.55 * sin(rot * 3.0 + t * 1.4);
  vec3 rimCol = mix(C_ICE, C_CYAN, 0.35) * rim * rimWobble * (1.25 + audio * 1.5);

  vec3 orbCol = body * inner;

  // halo: tight cyan glow + wide royal-purple aura
  float d = max(r - R, 0.0);
  float halo = exp(-d * 5.0) * 0.50 + exp(-d * 1.8) * 0.20;
  vec3 haloCol = mix(C_ROYAL, C_CYAN, 0.45) * halo * (0.75 + audio * 1.1);

  // energy ripple rings expanding outward
  float rings = sin((r - R) * 26.0 - iTime * 1.6) * 0.5 + 0.5;
  rings *= exp(-d * 4.0) * (0.08 + audio * 0.30);
  vec3 ringCol = C_CYAN * rings;

  // faint light wisp escaping the top of the sphere
  float wispAng = (ang - 1.5707 + sin(t) * 0.3) * 1.4;
  float wisp = exp(-wispAng * wispAng) * exp(-d * 3.0) * 0.22;
  vec3 wispCol = C_ICE * wisp;

  vec3 col = orbCol + rimCol + haloCol + ringCol + wispCol;

  // gentle idle breathing so it never feels frozen
  col *= 0.92 + 0.08 * sin(iTime * 0.55);

  // highlight roll-off + dither (kills banding on dark gradients)
  col = col / (1.0 + col * 0.22);
  col += (hash21(fragCoord * 0.7 + iTime) - 0.5) * 0.010;

  fragColor = vec4(col, 1.0);
}
`;

/** Baseline "energy" of the orb for each agent state. */
const STATE_ENERGY: Record<string, number> = {
  disconnected: 0.1,
  idle: 0.12,
  failed: 0.1,
  listening: 0.22,
  'pre-connect-buffering': 0.3,
  connecting: 0.3,
  initializing: 0.3,
  thinking: 0.38,
  speaking: 0.28, // plus live volume on top
};

export function AIOrbLayer() {
  const { state, audioTrack } = useVoiceAssistant();
  const volume = useTrackVolume(audioTrack, {
    fftSize: 512,
    smoothingTimeConstant: 0.55,
  });

  const uniforms = useMemo(() => {
    const base = STATE_ENERGY[state ?? 'disconnected'] ?? 0.12;
    // Quantised so we re-render only when the level meaningfully changes.
    const level = Math.round(Math.min(1, Math.max(base, volume * 2.5)) * 100) / 100;
    return { iAudio: { type: '1f', value: level } };
  }, [state, volume]);

  return (
    <div className="absolute inset-0 opacity-90 mix-blend-screen">
      <ReactShaderToy
        fs={AI_ORB_SHADER}
        uniforms={uniforms}
        precision="highp"
        devicePixelRatio={1}
        contextAttributes={{ alpha: true, depth: false, antialias: false }}
      />
    </div>
  );
}
