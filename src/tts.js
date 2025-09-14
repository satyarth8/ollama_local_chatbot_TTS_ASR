import { Communicate } from "edge-tts-universal/browser";

export async function streamAndPlayText(text) {
  const voice = "en-US-EmmaMultilingualNeural";
  const communicate = new Communicate(text, { voice });

  // Create a MediaSource for streaming playback
  const mediaSource = new MediaSource();
  const audio = new Audio();
  audio.src = URL.createObjectURL(mediaSource);
  audio.autoplay = true;

  mediaSource.addEventListener("sourceopen", async () => {
    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

    // Stream audio chunks progressively
    for await (const chunk of communicate.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        // Append chunk data to source buffer
        sourceBuffer.appendBuffer(chunk.data);

        // Wait for updateend to avoid overfilling sourceBuffer
        await new Promise(resolve => {
          sourceBuffer.addEventListener("updateend", resolve, { once: true });
        });
      }
    }

    // Signal that all audio data has been appended
    mediaSource.endOfStream();
  });

  // Error handling
  audio.onerror = () => {
    console.error("Audio playback error");
  };

  console.log("Streaming TTS started");
}
