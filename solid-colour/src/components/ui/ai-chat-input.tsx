"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Adapted from the 21st.dev "ai-chat-input" community component: model logos are passed in as
// options instead of hotlinked, voice input only appears where the browser can transcribe (no
// simulated text), attachments and collapsing are opt-in, and model / effort can be controlled.

// ----------------------------------------------------------------------
// Transition Physics
// ----------------------------------------------------------------------
const SPRING = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SPRING_TRANSITION = `max-width 0.4s ${SPRING}, height 0.4s ${SPRING}`;
const SMOOTH_HEIGHT_TRANSITION = `max-width 0.4s ${SPRING}, height 0.15s ease-out`;
const MIN_TEXTAREA = 68;
const MAX_TEXTAREA = 160;

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Attachment {
  id: string;
  file: File;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

export interface PromptInputOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

// Minimal Web Speech API surface; lib.dom does not ship these types.
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface SpeechRecognizer {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognizerCtor = new () => SpeechRecognizer;

function getSpeechRecognition(): SpeechRecognizerCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognizerCtor; webkitSpeechRecognition?: SpeechRecognizerCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------
function MorphingText({ text }: { text: string }) {
  const [width, setWidth] = useState<number | "auto">("auto");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">
        {text}
      </span>
      <span
        key={text}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
      >
        {text}
      </span>
    </span>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.75" />
      <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Three bars filled up to the current step, so any number of effort levels reads low → high. */
function DynamicBarsIcon({ index, count }: { index: number; count: number }) {
  const level = count <= 1 ? 2 : Math.round((index / (count - 1)) * 2);
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="8" width="2.5" height="4.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={1} />
      <rect x="5.75" y="5" width="2.5" height="7.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={level >= 1 ? 1 : 0.3} />
      <rect x="10" y="2" width="2.5" height="10.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={level >= 2 ? 1 : 0.3} />
    </svg>
  );
}

// ----------------------------------------------------------------------
// Attachment Thumbnail
// ----------------------------------------------------------------------
function AttachmentThumb({
  attachment,
  index,
  onRemove,
  onOpen,
}: {
  attachment: Attachment;
  index: number;
  onRemove: (id: string) => void;
  onOpen: (attachment: Attachment, rect: DOMRect) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={btnRef}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (btnRef.current) {
          onOpen(attachment, btnRef.current.getBoundingClientRect());
        }
      }}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "backwards" }}
      className={cn(
        "group relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted outline-none",
        "transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.04] active:scale-[0.96]",
        "animate-in fade-in slide-in-from-top-3 zoom-in-90 duration-400"
      )}
      aria-label={`Open preview of ${attachment.name}`}
    >
      <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      <span className={cn("absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200", isHovered && "bg-black/25")}>
        <span
          role="button"
          tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); onRemove(attachment.id); }}
          className={cn(
            "m-1 flex size-4 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-background hover:text-foreground hover:scale-110",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
          )}
          aria-label={`Remove ${attachment.name}`}
        >
          <CloseIcon />
        </span>
      </span>
    </button>
  );
}

// ----------------------------------------------------------------------
// Shared-Element Gallery Modal
// ----------------------------------------------------------------------
function AttachmentGalleryModal({
  attachment,
  originRect,
  onClose,
}: {
  attachment: Attachment;
  originRect: DOMRect;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"opening" | "open" | "closing">("opening");
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number; radius: number } | null>(null);

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560);
    const maxH = Math.min(window.innerHeight * 0.78, 720);

    const naturalW = attachment.width || 800;
    const naturalH = attachment.height || 600;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6);

    const width = naturalW * scale;
    const height = naturalH * scale;

    setTargetRect({
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height,
      radius: 20,
    });

    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [attachment]);

  const handleClose = useCallback(() => setPhase("closing"), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const isOpen = phase === "open";
  const isClosing = phase === "closing";

  const geometry = isOpen && targetRect
    ? targetRect
    : { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height, radius: 12 };

  const animEasing = isClosing ? "ease-out" : SPRING;
  const animDur = isClosing ? "0.3s" : "0.45s";
  const flipTransition = ["top", "left", "width", "height", "border-radius"].map((p) => `${p} ${animDur} ${animEasing}`).join(", ");

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose} role="dialog" aria-modal="true" aria-label={attachment.name}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-400" style={{ opacity: isOpen ? 1 : 0 }} />
      <div
        style={{
          position: "fixed",
          top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.height,
          borderRadius: geometry.radius, transition: flipTransition, overflow: "hidden",
          boxShadow: isOpen ? "0 24px 60px -12px rgb(0 0 0 / 0.35)" : "0 0px 0px 0px rgb(0 0 0 / 0)",
        }}
        className="bg-muted"
        onTransitionEnd={() => { if (phase === "closing") onClose(); }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Close preview"
        style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "scale(1)" : "scale(0.7)" }}
        className={cn(
          "fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground/70 shadow-md backdrop-blur-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-card hover:text-foreground",
          !isOpen && "pointer-events-none"
        )}
      >
        <span className="scale-150"><CloseIcon /></span>
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export interface PromptInputProps {
  onSubmit?: (
    value: string,
    meta: { model: string; effort: string; attachments: File[] }
  ) => void;
  placeholder?: string;
  className?: string;
  /** Options for the picker on the left of the toolbar; the picker hides when empty. */
  models?: PromptInputOption[];
  /** Labels the effort pill cycles through, lowest first; the pill hides when empty. */
  efforts?: string[];
  /** Controlled model value (an option's `value`). */
  model?: string;
  onModelChange?: (value: string) => void;
  /** Controlled effort index into `efforts`. */
  effortIndex?: number;
  onEffortChange?: (index: number) => void;
  defaultEffortIndex?: number;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  maxAttachments?: number;
  /** Show the image attach button. */
  allowAttachments?: boolean;
  /** Show the mic when the browser supports speech recognition. */
  allowVoice?: boolean;
  /** Start as a one-line pill that expands on focus and collapses again when emptied and blurred. */
  collapsible?: boolean;
  collapsedWidth?: number;
  expandedWidth?: number;
  /** A request is in flight: typing stays open, sending is blocked and the button spins. */
  busy?: boolean;
  autoFocus?: boolean;
  /** Accessible name for the textarea. */
  inputLabel?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      onSubmit,
      placeholder = "Ask anything",
      className,
      models = [],
      efforts = ["Low", "Medium", "Max Effort"],
      model: controlledModel,
      onModelChange,
      effortIndex: controlledEffort,
      onEffortChange,
      defaultEffortIndex = 1,
      defaultValue = "",
      value: controlledValue,
      onChange,
      maxAttachments = 6,
      allowAttachments = true,
      allowVoice = true,
      collapsible = true,
      collapsedWidth = 320,
      expandedWidth = 480,
      busy = false,
      autoFocus = false,
      inputLabel = "Prompt",
      inputRef,
    },
    ref
  ) => {
    const [expandedState, setExpanded] = useState(!collapsible);
    // Turning `collapsible` off (e.g. when the input docks into a thread) always shows it open.
    const expanded = expandedState || !collapsible;
    const [isSmoothResize, setIsSmoothResize] = useState(false);
    const [localValue, setLocalValue] = useState(defaultValue);
    const [localModel, setLocalModel] = useState(models[0]?.value ?? "");
    const [localEffort, setLocalEffort] = useState(defaultEffortIndex);
    const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
    const [speechSupported] = useState(() => getSpeechRecognition() !== null);

    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeAttachment, setActiveAttachment] = useState<{ attachment: Attachment; rect: DOMRect } | null>(null);

    // Audio/Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(() => new Array(5).fill(0));

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const selectedModelValue = controlledModel ?? localModel;
    const selectedModel = models.find((m) => m.value === selectedModelValue) ?? models[0];
    const effortIndex = Math.min(controlledEffort ?? localEffort, Math.max(efforts.length - 1, 0));
    const hasValue = value.trim() !== "" || attachments.length > 0;
    const hasAttachments = attachments.length > 0;
    const showVoice = allowVoice && speechSupported;

    const valueRef = useRef(value);
    const attachmentsRef = useRef(attachments);

    // Refs for Web Audio & Speech Recognition cleanup
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognizer | null>(null);
    const idleBarsRef = useRef<number | null>(null);

    const [hoverStyle, setHoverStyle] = useState({ opacity: 0, transform: "translateY(0px) scale(0.95)", transition: "none" });
    const [containerHeight, setContainerHeight] = useState(116);
    const [textareaHeight, setTextareaHeight] = useState(MIN_TEXTAREA);
    const [isScrolling, setIsScrolling] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalContainerRef = useRef<HTMLDivElement | null>(null);
    const topFadeRef = useRef<HTMLDivElement>(null);
    const bottomFadeRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useImperativeHandle(inputRef, () => textareaRef.current as HTMLTextAreaElement, []);

    useEffect(() => {
      valueRef.current = value;
      attachmentsRef.current = attachments;
    }, [value, attachments]);

    const setModel = (v: string) => {
      if (controlledModel === undefined) setLocalModel(v);
      onModelChange?.(v);
    };

    const setEffort = (i: number) => {
      if (controlledEffort === undefined) setLocalEffort(i);
      onEffortChange?.(i);
    };

    const collapse = () => {
      if (!collapsible) return;
      setIsSmoothResize(false);
      setExpanded(false);
      setIsModelSelectOpen(false);
    };

    const updateFades = () => {
      const el = textareaRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (topFadeRef.current) {
        topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
      }
      if (bottomFadeRef.current) {
        const bottomScroll = scrollHeight - clientHeight - scrollTop;
        bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString();
      }
    };

    const handleValueChange = useCallback((val: string) => {
      setIsSmoothResize(true);
      if (!isControlled) setLocalValue(val);
      onChange?.(val);
    }, [isControlled, onChange]);

    const expand = () => {
      setIsSmoothResize(false);
      setExpanded(true);
    };

    // --- Voice Recording Logic ---
    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        recognition.onend = null;
        recognition.stop();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (idleBarsRef.current) {
        window.clearInterval(idleBarsRef.current);
        idleBarsRef.current = null;
      }
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    const startRecording = useCallback(async () => {
      const Recognition = getSpeechRecognition();
      if (!Recognition) return;
      setIsSmoothResize(false);
      setExpanded(true);
      setIsRecording(true);

      // The level meter is a nicety: if the mic stream is unavailable the bars idle instead.
      let stream: MediaStream | null = null;
      try {
        stream = (await navigator.mediaDevices?.getUserMedia({ audio: true })) ?? null;
      } catch {
        stream = null;
      }

      if (stream) {
        streamRef.current = stream;
        const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
        const AudioCtx = w.AudioContext ?? w.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          audioCtx.createMediaStreamSource(stream).connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const step = Math.floor(dataArray.length / 5);

          const updateVisualizer = () => {
            analyser.getByteFrequencyData(dataArray);
            const bands = new Array(5).fill(0).map((_, i) => {
              let sum = 0;
              for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
              return sum / step / 255;
            });
            setAudioData(bands);
            rafRef.current = requestAnimationFrame(updateVisualizer);
          };
          updateVisualizer();
        }
      } else {
        idleBarsRef.current = window.setInterval(() => {
          setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.35 + 0.1));
        }, 140);
      }

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      let baseline = valueRef.current;

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) finalTranscript += result[0].transcript;
          else interimTranscript += result[0].transcript;
        }
        if (finalTranscript) {
          baseline += (baseline ? " " : "") + finalTranscript.trim();
        }
        handleValueChange((baseline + (interimTranscript ? " " + interimTranscript : "")).trim());
      };
      recognition.onerror = () => stopRecording();
      recognition.onend = () => stopRecording();

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        stopRecording();
      }
    }, [handleValueChange, stopRecording]);

    // Keep textarea auto-scrolled to bottom while recording
    useEffect(() => {
      if (isRecording && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, [value, isRecording]);

    // Release the mic and every object URL on unmount only.
    useEffect(() => {
      return () => {
        stopRecording();
        attachmentsRef.current.forEach((a) => URL.revokeObjectURL(a.url));
      };
    }, [stopRecording]);

    useEffect(() => {
      if ((value.trim() !== "" || hasAttachments) && !expanded) {
        setIsSmoothResize(false);
        setExpanded(true);
      }
    }, [value, expanded, hasAttachments]);

    useEffect(() => {
      if (!collapsible && !autoFocus) return;
      if (expanded && !isRecording) {
        const timer = setTimeout(() => {
          const el = textareaRef.current;
          if (!el || (!collapsible && document.activeElement === el)) return;
          el.focus({ preventScroll: true });
          el.setSelectionRange(el.value.length, el.value.length);
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [expanded, isRecording, collapsible, autoFocus]);

    // Height follows the text only; adding attachments leaves it alone.
    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;

      const currentHeight = el.style.height;
      el.style.transition = "none";
      el.style.height = "0px";
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      void el.offsetHeight;
      el.style.transition = "";

      const newHeight = Math.max(MIN_TEXTAREA, Math.min(scrollHeight, MAX_TEXTAREA));
      el.style.height = `${newHeight}px`;

      setTextareaHeight(newHeight);
      setIsScrolling(scrollHeight > MAX_TEXTAREA);

      const t = setTimeout(updateFades, 0);
      return () => clearTimeout(t);
    }, [value, expanded]);

    useEffect(() => {
      setContainerHeight(Math.max(116, textareaHeight + 48));
      const t = setTimeout(updateFades, 0);
      return () => clearTimeout(t);
    }, [textareaHeight]);

    useEffect(() => {
      if (!isModelSelectOpen) return;
      const handleOutsideClick = (e: MouseEvent) => {
        if (internalContainerRef.current && !internalContainerRef.current.contains(e.target as Node)) {
          setIsModelSelectOpen(false);
        }
      };
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsModelSelectOpen(false);
      };
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleKey);
      };
    }, [isModelSelectOpen]);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget as Node)) return;
      setIsModelSelectOpen(false);
      if (value.trim() === "" && !hasAttachments && !isRecording) collapse();
    };

    const handleSubmit = () => {
      if (busy || (value.trim() === "" && !hasAttachments)) return;
      if (isRecording) stopRecording();
      setIsSmoothResize(false);
      onSubmit?.(value, {
        model: selectedModel?.value ?? "",
        effort: efforts[effortIndex] ?? "",
        attachments: attachments.map((a) => a.file),
      });
      handleValueChange("");
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      setAttachments([]);
      setIsModelSelectOpen(false);
      if (collapsible) setExpanded(false);
    };

    const cycleEffort = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEffort((effortIndex + 1) % efforts.length);
    };

    const openFileChooser = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const addAttachment = (file: File, url: string, width: number, height: number) => {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
      setAttachments((prev) => [...prev, { id, file, url, name: file.name, width, height }]);
    };

    const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
      e.target.value = "";

      if (files.length === 0) return;
      const room = Math.max(0, maxAttachments - attachments.length);
      const accepted = files.slice(0, room);

      if (!expanded) { setIsSmoothResize(false); setExpanded(true); }
      else { setIsSmoothResize(true); }

      for (const file of accepted) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => addAttachment(file, url, img.naturalWidth, img.naturalHeight);
        img.onerror = () => addAttachment(file, url, 800, 600);
        img.src = url;
      }
    };

    const removeAttachment = (id: string) => {
      setIsSmoothResize(true);
      setAttachments((prev) => {
        const target = prev.find((a) => a.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((a) => a.id !== id);
      });
    };

    // Action button: spinner while busy, stop while recording, send when there is something to
    // send, mic when empty (and supported), otherwise a resting send arrow.
    const showBusy = busy && !isRecording;
    const showStop = isRecording;
    const showMic = !busy && !hasValue && !isRecording && showVoice;
    const showArrow = !showBusy && !showStop && !showMic;
    const actionDisabled = showBusy || (showArrow && !hasValue);

    const onActionButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isRecording) stopRecording();
      else if (hasValue) handleSubmit();
      else if (showMic) void startRecording();
    };

    const iconSlot = (visible: boolean, rotate: "rotate-45" | "-rotate-45") =>
      cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
        visible ? "opacity-100 scale-100 rotate-0 blur-none" : cn("opacity-0 scale-50 blur-[1px] pointer-events-none", rotate)
      );

    return (
      <>
        {/* Outer Wrapper for positioning and max-width scaling */}
        <div
          ref={(node) => {
            internalContainerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          onBlur={handleBlur}
          className={cn("relative flex w-full flex-col", className)}
          style={{
            maxWidth: expanded ? expandedWidth : collapsedWidth,
            transition: isSmoothResize ? "max-width 0.15s ease-out" : `max-width 0.4s ${SPRING}`,
          }}
        >
          {allowAttachments && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChosen}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
          )}

          {/* Attachment tab: slides up from behind the card */}
          {allowAttachments && (
            <div
              aria-hidden={!hasAttachments}
              style={{
                height: hasAttachments && expanded ? 68 : 0,
                transition: isSmoothResize ? "height 0.15s ease-out" : `height 0.4s ${SPRING}`,
              }}
              className="relative z-0 w-full overflow-hidden"
            >
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: 20,
                  right: 20,
                  height: 68,
                  transform: hasAttachments && expanded ? "translateY(0)" : "translateY(100%)",
                  opacity: hasAttachments && expanded ? 1 : 0,
                  transition: isSmoothResize
                    ? "transform 0.15s ease-out, opacity 0.15s ease-out"
                    : `transform 0.4s ${SPRING}, opacity 0.3s ease-out`,
                }}
                className="prompt-scrollbar flex items-start gap-2 overflow-x-auto rounded-t-2xl border border-b-0 border-border bg-muted px-2 pt-2 pb-1"
              >
                {attachments.map((attachment, index) => (
                  <AttachmentThumb
                    key={attachment.id}
                    attachment={attachment}
                    index={index}
                    onRemove={removeAttachment}
                    onOpen={(a, rect) => setActiveAttachment({ attachment: a, rect })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Input Card */}
          <div
            data-slot="prompt-card"
            onMouseDown={(e) => {
              const isTextarea = e.target === textareaRef.current;
              if (expanded && !isTextarea && !isRecording) {
                e.preventDefault();
                textareaRef.current?.focus();
              }
            }}
            style={{
              borderRadius: 22,
              height: expanded ? containerHeight : 48,
              transition: `${isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION}, border-color 0.2s ease, box-shadow 0.2s ease`,
              overflow: expanded ? "visible" : "hidden",
            }}
            className={cn(
              "prompt-card relative z-10 w-full border border-input bg-card focus-within:border-ring",
              expanded ? "cursor-text" : "cursor-default"
            )}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => { if (!expanded) expand(); }}
              onScroll={updateFades}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape" && value.trim() === "" && !hasAttachments) collapse();
              }}
              placeholder={placeholder}
              aria-label={inputLabel}
              disabled={isRecording}
              tabIndex={expanded ? 0 : -1}
              style={{
                transition: isSmoothResize
                  ? "height 0.15s ease-out"
                  : `opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s ${SPRING}`,
              }}
              className={cn(
                "prompt-scrollbar absolute inset-x-0 top-0 z-[1] w-full cursor-text resize-none bg-transparent py-3.5 pr-12 pl-4 text-sm leading-[22px] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:outline-none",
                expanded ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0",
                isScrolling ? "overflow-y-auto" : "overflow-y-hidden",
                isRecording && "pointer-events-none"
              )}
            />

            <div
              ref={topFadeRef}
              className="pointer-events-none absolute top-0 right-12 left-4 z-[2] h-8 bg-gradient-to-b from-card via-card/90 to-transparent opacity-0"
            />
            <div
              ref={bottomFadeRef}
              className="pointer-events-none absolute right-12 left-4 z-[2] h-8 bg-gradient-to-t from-card via-card/90 to-transparent"
              style={{
                opacity: 0,
                top: `${textareaHeight - 32}px`,
                transition: isSmoothResize ? "top 0.15s ease-out" : `top 0.4s ${SPRING}`,
              }}
            />

            {collapsible && (
              <button
                type="button"
                onClick={expand}
                tabIndex={expanded ? -1 : 0}
                style={{ transition: isSmoothResize ? "none" : `all 0.4s ${SPRING}` }}
                className={cn(
                  "absolute inset-x-0 top-0 z-[1] cursor-text py-[15px] pr-12 pl-4 text-left text-sm leading-[17px] text-muted-foreground/70 outline-none",
                  !expanded ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-1 scale-105 opacity-0"
                )}
                aria-label="Open prompt input"
              >
                {placeholder}
              </button>
            )}

            {/* Toolbar: hides while recording to make room for the level meter */}
            <div
              className={cn(
                "absolute right-12 bottom-2 left-2.5 z-[10] flex items-center gap-0.5 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                expanded && !isRecording ? "pointer-events-auto translate-y-0 opacity-100 blur-none" : "pointer-events-none translate-y-2 opacity-0 blur-sm"
              )}
            >
              {selectedModel && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModelSelectOpen((prev) => !prev);
                    }}
                    className={cn(
                      "group flex h-7 items-center gap-1 rounded-full pr-2 pl-2 text-muted-foreground transition-colors duration-200 outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground",
                      isModelSelectOpen && "bg-accent text-foreground"
                    )}
                    aria-haspopup="menu"
                    aria-expanded={isModelSelectOpen}
                    aria-label={`${selectedModel.label}. Change`}
                  >
                    {selectedModel.icon && (
                      <span className="flex size-3.5 items-center justify-center opacity-80 transition-opacity group-hover:opacity-100 [&_svg]:size-3.5">
                        {selectedModel.icon}
                      </span>
                    )}
                    <span className="text-xs select-none">
                      <MorphingText text={selectedModel.label} />
                    </span>
                    <ChevronIcon />
                  </button>

                  <div
                    role="menu"
                    style={{ transformOrigin: "bottom left" }}
                    onMouseLeave={() => {
                      setHoverStyle((prev) => ({
                        ...prev, opacity: 0, transform: prev.transform.replace("scale(1)", "scale(0.95)"), transition: "opacity 0.2s ease-in, transform 0.2s ease-out",
                      }));
                    }}
                    className={cn(
                      "absolute bottom-full left-0 z-50 mb-2.5 flex w-52 flex-col gap-0.5 rounded-2xl border border-border bg-popover/95 p-1 shadow-xl backdrop-blur-md transition-all duration-400",
                      isModelSelectOpen
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        : "pointer-events-none translate-y-3 scale-95 opacity-0 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                    )}
                  >
                    <div className="relative flex flex-col gap-0.5">
                      <div style={hoverStyle} className="pointer-events-none absolute top-0 right-0 left-0 -z-10 h-8 rounded-xl bg-accent" />
                      {models.map((option, idx) => {
                        const active = option.value === selectedModel.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            tabIndex={isModelSelectOpen ? 0 : -1}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => {
                              setHoverStyle((prev) => ({
                                opacity: 1, transform: `translateY(${idx * 34}px) scale(1)`,
                                transition: prev.opacity === 0 ? "opacity 0.15s ease-out" : `transform 0.3s ${SPRING}, opacity 0.15s ease`,
                              }));
                            }}
                            onClick={(e) => { e.stopPropagation(); setModel(option.value); setIsModelSelectOpen(false); }}
                            className={cn(
                              "group relative flex h-8 w-full items-center justify-between rounded-xl px-2.5 text-left text-xs outline-none focus-visible:bg-accent active:scale-[0.98]",
                              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {option.icon && <span className="flex size-3.5 items-center justify-center [&_svg]:size-3.5">{option.icon}</span>}
                              {option.label}
                            </span>
                            {active && <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {efforts.length > 0 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cycleEffort}
                  aria-label={`${efforts[effortIndex]}. Change`}
                  className="group flex h-7 items-center gap-1 rounded-full px-2 text-muted-foreground transition-colors duration-200 outline-none hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                >
                  <DynamicBarsIcon index={effortIndex} count={efforts.length} />
                  <span className="text-xs select-none"><MorphingText text={efforts[effortIndex]} /></span>
                </button>
              )}

              {allowAttachments && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openFileChooser}
                  disabled={attachments.length >= maxAttachments}
                  aria-label="Attach images"
                  className="ml-auto flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 outline-none hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <PlusIcon />
                </button>
              )}
            </div>

            {/* Level meter, just left of the action button */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                isRecording ? "w-16 translate-x-0 opacity-100" : "pointer-events-none w-0 translate-x-4 opacity-0"
              )}
            >
              {audioData.map((val, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out"
                  style={{ height: `${Math.max(4, val * 24)}px` }}
                />
              ))}
            </div>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={onActionButtonClick}
              disabled={actionDisabled}
              aria-label={showBusy ? "Working" : showStop ? "Stop recording" : showMic ? "Use voice input" : "Send prompt"}
              className={cn(
                "absolute right-2 bottom-2 z-[10] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none transition-all duration-300 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95",
                actionDisabled && !showBusy && "opacity-30 hover:opacity-30",
                "disabled:cursor-default"
              )}
            >
              <span className="relative flex size-full items-center justify-center">
                <span className={iconSlot(showArrow, "rotate-45")}><ArrowUpIcon /></span>
                <span className={iconSlot(showMic, "-rotate-45")}><MicIcon /></span>
                <span className={iconSlot(showStop, "rotate-45")}><StopIcon /></span>
                <span className={iconSlot(showBusy, "rotate-45")}><SpinnerIcon /></span>
              </span>
            </button>
          </div>
        </div>

        {activeAttachment && (
          <AttachmentGalleryModal
            attachment={activeAttachment.attachment}
            originRect={activeAttachment.rect}
            onClose={() => setActiveAttachment(null)}
          />
        )}
      </>
    );
  }
);

PromptInput.displayName = "PromptInput";
