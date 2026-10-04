class GroqUnavailableError(Exception):
    """Raised when Groq cannot complete an analysis. Never fabricate a substitute result."""

    def __init__(self, detail: str | None = None):
        self.detail = detail or (
            "AI analysis is currently unavailable. Please check the configured Groq API/model."
        )
        super().__init__(self.detail)
