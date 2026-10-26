# Decisions

- **Embedded case data:** Suspects and evidence are embedded in the case document. This simplifies case-scoped references and atomic resolution while preserving the logical data boundaries through explicit serializers.
- **Synchronous generation:** The MVP uses the spec's allowed synchronous path. Requests can take up to the configured Gemini timeout and deployments should account for that.
- **No image credentials:** Images use labeled placeholders unless a future image provider is configured. The app never claims placeholder media is generated photography.
- **No demo fallback:** Missing Gemini credentials produce a clear service error; production paths do not silently generate hard-coded cases.
