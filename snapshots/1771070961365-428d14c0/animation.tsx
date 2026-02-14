import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MyAnimation = () => {
  /*
    A WhatsApp-style chat scene where messages enter one-by-one with a bouncy spring.
    Sent messages align to the right in green, while received messages align to the left in gray.
    Subtle motion polish (slide + scale + blur) and a small "tail" accent make the bubbles feel native.
  */

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const COLOR_BACKGROUND = "#0b141a";
  const COLOR_SENT = "#1f8a70";
  const COLOR_RECEIVED = "#202c33";
  const COLOR_TEXT = "#e9edef";
  const COLOR_META = "rgba(233, 237, 239, 0.6)";

  const TITLE_TEXT = "WhatsApp Chat";
  const SUBTITLE_TEXT = "Messages appear one-by-one";

  const MESSAGES = [
    { id: "m1", sent: false, text: "Hey! Are we still on for later?" },
    { id: "m2", sent: true, text: "Yep — 7pm works. I’ll bring the laptop." },
    { id: "m3", sent: false, text: "Perfect. Want me to grab snacks?" },
    { id: "m4", sent: true, text: "Yes please. Anything spicy is a win." },
    { id: "m5", sent: false, text: "Deal. See you soon!" },
    { id: "m6", sent: true, text: "See you 👋" },
  ];

  const TOP_BAR_HEIGHT = Math.max(56, Math.round(height * 0.09));
  const PADDING_X = Math.max(28, Math.round(width * 0.05));
  const PADDING_Y = Math.max(22, Math.round(height * 0.04));
  const GAP_Y = Math.max(10, Math.round(height * 0.012));
  const BUBBLE_MAX_WIDTH = Math.max(420, Math.round(width * 0.68));

  const STAGGER_FRAMES = 18;
  const ENTER_DURATION = 28;
  const BASE_START = 12;

  const CORNER_RADIUS = 18;
  const BUBBLE_PADDING_Y = Math.max(10, Math.round(height * 0.012));
  const BUBBLE_PADDING_X = Math.max(14, Math.round(width * 0.018));

  const HEADER_ENTER_DELAY = 2;
  const headerProgress = spring({
    frame: frame - HEADER_ENTER_DELAY,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.8 },
    durationInFrames: 26,
  });
  const headerY = interpolate(headerProgress, [0, 1], [-14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chatInsetTop = TOP_BAR_HEIGHT + PADDING_Y;

  // Subtle "breathing" motion so the scene doesn't feel static after all messages land.
  const idleFloat = interpolate(
    Math.sin((frame / fps) * 1.1),
    [-1, 1],
    [-2, 2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BACKGROUND, fontFamily: "Inter, sans-serif" }}>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: TOP_BAR_HEIGHT,
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ color: COLOR_TEXT, fontSize: Math.max(18, Math.round(width * 0.022)), fontWeight: 700, letterSpacing: -0.2 }}>
            {TITLE_TEXT}
          </div>
          <div style={{ color: COLOR_META, fontSize: Math.max(12, Math.round(width * 0.014)), fontWeight: 500 }}>
            {SUBTITLE_TEXT}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#22c55e",
              boxShadow: "0 0 0 4px rgba(34,197,94,0.12)",
            }}
          />
          <div style={{ color: COLOR_META, fontSize: Math.max(12, Math.round(width * 0.014)), fontWeight: 600 }}>Online</div>
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: chatInsetTop,
          bottom: 0,
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
          paddingBottom: PADDING_Y,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: GAP_Y,
          transform: `translateY(${idleFloat}px)`,
        }}
      >
        {MESSAGES.map((msg, i) => {
          const startFrame = BASE_START + i * STAGGER_FRAMES;

          const enterSpring = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 10, stiffness: 190, mass: 0.75 },
            durationInFrames: ENTER_DURATION,
          });

          const settleSpring = spring({
            frame: frame - (startFrame + 6),
            fps,
            config: { damping: 18, stiffness: 120, mass: 1.1 },
            durationInFrames: 40,
          });

          const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const fromX = msg.sent ? 54 : -54;
          const slideX = interpolate(enterSpring, [0, 1], [fromX, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const popScale = interpolate(enterSpring, [0, 1], [0.92, 1.02], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const settleScale = interpolate(settleSpring, [0, 1], [1.02, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const scale = popScale * settleScale;

          const blur = interpolate(opacity, [0, 1], [8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const bubbleBg = msg.sent ? COLOR_SENT : COLOR_RECEIVED;

          // Little micro "ping" pulse shortly after the bubble lands (very subtle).
          const pulse = interpolate(
            frame,
            [startFrame + 16, startFrame + 22, startFrame + 30],
            [1, 1.03, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sent ? "flex-end" : "flex-start",
                width: "100%",
                opacity,
              }}
            >
              <div
                style={{
                  maxWidth: BUBBLE_MAX_WIDTH,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  transform: `translateX(${slideX}px) scale(${scale * pulse})`,
                  transformOrigin: msg.sent ? "100% 100%" : "0% 100%",
                  filter: `blur(${blur}px)`,
                  willChange: "transform, filter, opacity",
                }}
              >
                {/* Bubble with tail */}
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      backgroundColor: bubbleBg,
                      color: COLOR_TEXT,
                      padding: `${BUBBLE_PADDING_Y}px ${BUBBLE_PADDING_X}px`,
                      borderRadius: CORNER_RADIUS,
                      lineHeight: 1.25,
                      fontSize: Math.max(16, Math.round(width * 0.02)),
                      fontWeight: 500,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        marginTop: Math.max(6, Math.round(height * 0.008)),
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        fontSize: Math.max(11, Math.round(width * 0.013)),
                        color: "rgba(233,237,239,0.62)",
                        fontWeight: 600,
                        letterSpacing: 0.2,
                      }}
                    >
                      <span>7:{10 + i} PM</span>
                      {msg.sent ? <span style={{ color: "rgba(233,237,239,0.7)" }}>✓✓</span> : null}
                    </div>
                  </div>

                  {/* Tail */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      width: 12,
                      height: 12,
                      backgroundColor: bubbleBg,
                      transform: "rotate(45deg)",
                      borderRadius: 3,
                      boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
                      ...(msg.sent ? { right: -5 } : { left: -5 }),
                      borderLeft: msg.sent ? "none" : "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      borderRight: msg.sent ? "1px solid rgba(255,255,255,0.06)" : "none",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};