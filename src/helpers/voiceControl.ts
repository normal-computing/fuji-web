import { useAppState } from "../state/store";
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

  public startListening = (): void => {
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
}

export const voiceControl = new VoiceControlManager();
