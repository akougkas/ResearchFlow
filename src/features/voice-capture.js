/**
 * Voice Capture Engine - Web Speech API wrapper for hands-free research task dictation
 * Auto-detects research categories based on spoken keywords.
 */

export class VoiceCaptureEngine {
    constructor() {
        const SpeechRecognition = (typeof window !== 'undefined') ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
        this.isSupported = !!SpeechRecognition;
        this.recognition = SpeechRecognition ? new SpeechRecognition() : null;

        if (this.recognition) {
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
        }

        this.transcript = '';
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onStateChangeCallback = null;
    }

    start(onResult, onError, onStateChange) {
        if (!this.isSupported) {
            if (onError) onError('Web Speech API is not supported in this browser.');
            return false;
        }

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
        this.onStateChangeCallback = onStateChange;
        this.transcript = '';

        this.recognition.onresult = (event) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                current += event.results[i][0].transcript;
            }
            this.transcript = current;
            if (this.onResultCallback) {
                this.onResultCallback(this.transcript, this.autoCategorize(this.transcript));
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onErrorCallback) this.onErrorCallback(event.error);
            this.isListening = false;
            if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        };

        try {
            this.recognition.start();
            this.isListening = true;
            if (this.onStateChangeCallback) this.onStateChangeCallback(true);
            return true;
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            if (onError) onError(err.message);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        }
    }

    /**
     * Auto-detect category based on spoken keywords
     */
    autoCategorize(text) {
        const lower = text.toLowerCase();
        if (/\b(talk|talks|slide|slides|present|presentation|presentations|poster|posters|meeting|meetings|demo|demos|seminar)\b/.test(lower)) return 'presentation';
        if (/\b(write|writing|paper|papers|draft|drafts|manuscript|section|abstract|intro)\b/.test(lower)) return 'writing';
        if (/\b(grant|grants|fund|funding|budget|nsf|nih|proposal|proposals|money)\b/.test(lower)) return 'funding';
        if (/\b(read|reading|citation|citations|literature|review|arxiv|doi)\b/.test(lower)) return 'literature';
        if (/\b(data|stat|stats|statistics|plot|plots|csv|python|r|analyze|analysis)\b/.test(lower)) return 'data';
        if (/\b(experiment|experiments|lab|sample|samples|assay|assays|protocol|test|tests|measure)\b/.test(lower)) return 'experiment';
        return 'data'; // default
    }
}
