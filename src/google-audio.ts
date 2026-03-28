interface TranscribeRequest {
  audioBase64: string;
  mimeType: string;
  languageCode?: string;
}

interface SpeakRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
}

function inferEncoding(mimeType: string): "WEBM_OPUS" | "OGG_OPUS" | "MP3" | "LINEAR16" {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("webm")) {
    return "WEBM_OPUS";
  }

  if (normalized.includes("ogg")) {
    return "OGG_OPUS";
  }

  if (normalized.includes("mpeg") || normalized.includes("mp3")) {
    return "MP3";
  }

  return "LINEAR16";
}

export class GoogleAudioBridge {
  private readonly accessToken: string | undefined;
  private readonly geminiApiKey: string | undefined;
  private readonly geminiModel: string;
  private readonly ttsVoiceName: string | undefined;

  constructor() {
    this.accessToken =
      process.env.MMASION_GOOGLE_ACCESS_TOKEN ??
      process.env.MMASION_VERTEX_ACCESS_TOKEN ??
      process.env.GOOGLE_ACCESS_TOKEN;
    this.geminiApiKey =
      process.env.MMASION_GEMINI_API_KEY ??
      process.env.GEMINI_API_KEY ??
      process.env.MMASION_VERTEX_API_KEY;
    this.geminiModel = process.env.MMASION_AUDIO_GEMINI_MODEL ?? "gemini-2.5-flash";
    this.ttsVoiceName = process.env.MMASION_TTS_VOICE_NAME;
  }

  isAvailable(): boolean {
    return Boolean(this.accessToken || this.geminiApiKey);
  }

  detail(): string {
    if (this.accessToken) {
      return "Google Cloud Speech-to-Text and Text-to-Speech are available through server-side adapters.";
    }

    if (this.geminiApiKey) {
      return `Gemini API audio understanding is available for server-side transcription with ${this.geminiModel}.`;
    }

    return "Google audio bridge is not configured. Browser voice fallback remains available.";
  }

  async transcribe(request: TranscribeRequest): Promise<string> {
    if (this.accessToken) {
      const response = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          config: {
            encoding: inferEncoding(request.mimeType),
            languageCode: request.languageCode ?? "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
          audio: {
            content: request.audioBase64,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech-to-Text request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as {
        results?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
      };

      return payload.results
        ?.flatMap((result) => result.alternatives ?? [])
        .map((alternative) => alternative.transcript ?? "")
        .join(" ")
        .trim() || "";
    }

    if (!this.geminiApiKey) {
      throw new Error("Google audio bridge is not configured.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Generate a clean plain-text transcript of this speech. Return only the transcript text with no extra commentary.",
                },
                {
                  inlineData: {
                    mimeType: request.mimeType,
                    data: request.audioBase64,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Gemini audio is temporarily rate-limited.");
      }

      throw new Error(`Gemini audio transcription failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() || "";
  }

  async speak(request: SpeakRequest): Promise<string> {
    if (!this.accessToken) {
      throw new Error("Google audio bridge is not configured.");
    }

    const voice = this.ttsVoiceName
      ? {
          languageCode: request.languageCode ?? "en-US",
          name: request.voiceName ?? this.ttsVoiceName,
        }
      : {
          languageCode: request.languageCode ?? "en-US",
        };

    const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        input: { text: request.text },
        voice,
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Text-to-Speech request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { audioContent?: string };
    return payload.audioContent ?? "";
  }
}
