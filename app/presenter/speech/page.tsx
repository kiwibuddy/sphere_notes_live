import { SpeechBridge } from "@/components/presenter/SpeechBridge";

export const metadata = {
  title: "Speech bridge — SphereNotes Live",
  description:
    "Mac microphone bridge for live subtitles — Chrome on MacBook only",
};

export default function PresenterSpeechPage() {
  return <SpeechBridge />;
}
