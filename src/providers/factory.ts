import type { ProviderAdapter, RuntimeStatus } from "../contracts.js";
import { LocalSimulationProvider } from "./local-provider.js";
import { OllamaProvider } from "./ollama-provider.js";

interface CreateProviderOptions {
  preferred?: "auto" | "simulation" | "ollama";
  model?: string;
}

export async function createProvider(options: CreateProviderOptions = {}): Promise<{
  provider: ProviderAdapter;
  runtime: RuntimeStatus;
  selectedModel: string | null;
}> {
  const preferred = (options.preferred ?? process.env.MMASION_PROVIDER ?? "auto").toLowerCase();
  const preferredModel = options.model ?? process.env.MMASION_OLLAMA_MODEL ?? "gemma3:12b";

  if (preferred === "simulation") {
    return {
      provider: new LocalSimulationProvider(),
      runtime: {
        provider: "local-simulation",
        mode: "simulation",
        detail: "Using deterministic simulation provider.",
      },
      selectedModel: null,
    };
  }

  const availableModels = await OllamaProvider.listModels();
  const fallbackOrder = [
    preferredModel,
    "qwen2.5:7b-instruct",
    "qwen3-coder:latest",
    "qwen3-coder:30b",
  ];
  const resolvedModel =
    fallbackOrder.find((model) => availableModels.includes(model)) ??
    availableModels[0] ??
    preferredModel;
  const ollama = new OllamaProvider(resolvedModel);
  const healthy = await ollama.isAvailable();

  if (preferred === "ollama" && !healthy) {
    throw new Error("MMASION_PROVIDER=ollama but Ollama is not reachable.");
  }

  if (healthy) {
    return {
      provider: ollama,
      runtime: {
        provider: ollama.name,
        mode: "local-model",
        detail:
          resolvedModel === preferredModel
            ? `Using Ollama model ${ollama.model}.`
            : `Preferred model ${preferredModel} was unavailable. Using Ollama model ${ollama.model} instead.`,
      },
      selectedModel: ollama.model,
    };
  }

  return {
    provider: new LocalSimulationProvider(),
    runtime: {
        provider: "local-simulation",
        mode: "simulation",
        detail: "Ollama unavailable. Falling back to deterministic simulation provider.",
      },
    selectedModel: null,
  };
}
