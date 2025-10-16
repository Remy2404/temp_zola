export function AppInfoContent() {
  return (
    <div className="space-y-4">
      <p className="text-foreground leading-relaxed">
        <span className="font-medium">polymind</span> is the open-source
        interface for AI chat.
        <br />
        Multi-model, and fully self-hostable.
        <br />
        Use Gemini Deepseek , Openrouter, and more, all in one place.
        <br />
      </p>
      <p className="text-foreground leading-relaxed">
        The code is available on{" "}
        <a
          href="https://github.com/Remy2404/Polymind"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  )
}
