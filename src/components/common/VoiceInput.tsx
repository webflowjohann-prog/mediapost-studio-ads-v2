import React, { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  lang?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  disabled = false,
  lang = 'fr-FR',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isAvailable =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleRecording = useCallback(() => {
    if (!isAvailable) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isAvailable, isRecording, lang, onTranscript]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  if (!isAvailable) return null;

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={disabled}
      className={`p-2 rounded-full transition-all duration-200 ${
        isRecording
          ? 'bg-brand-red text-white animate-pulse'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      } disabled:opacity-40`}
      title={isRecording ? 'Arrêter' : 'Dicter'}
    >
      {isRecording ? (
        <div className="w-4 h-4 bg-white rounded-sm" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z"
          />
        </svg>
      )}
    </button>
  );
};
