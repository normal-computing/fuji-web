import { useAppState } from "../state/store";
import OpenAI from "openai";

type SetTranscriptionFunction = (transcript: string, isFinal: boolean) => void;

class VoiceControlManager {
  private recognition: SpeechRecognition | null;
  private cumulativeTranscript = "";
  private setTranscription: SetTranscriptionFunction | null = null;

  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            this.cumulativeTranscript += transcript.trim() + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (this.setTranscription) {
          this.setTranscription(
            this.cumulativeTranscript + interimTranscript,
            false,
          );
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    } else {
      console.error("Browser does not support Speech Recognition.");
      this.recognition = null;
    }
  }

  public startListening = async (): Promise<void> => {
    if (!this.recognition) {
      console.error("Speech Recognition is not initialized.");
      return;
    }

    this.cumulativeTranscript = "";
    this.setTranscription = useAppState.getState().ui.actions.setInstructions;
    this.recognition.start();
  };

  public stopListening = (): void => {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.setTranscription && this.cumulativeTranscript !== "") {
      this.setTranscription(this.cumulativeTranscript, true);
    }
    this.setTranscription = null;
  };

  public basicSpeak = (text: string): void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 2;
    speechSynthesis.speak(utterance);
  };

  public speak = async (text: string, onError: (error: string) => void) => {
    const key = useAppState.getState().settings.openAIKey ?? undefined;
    const openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });

    try {
      const mp3Response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
        speed: 1,
      });
      const arrayBuffer = await mp3Response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error generating or playing speech:", error);
      onError(error.message);
    }
  };
}

export const voiceControl = new VoiceControlManager();
