from pathlib import Path

from llama_cpp import Llama


MODEL_PATH = Path("models/ggml-model-Q4_K_M.gguf")


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"BioMistral model not found at: {MODEL_PATH.resolve()}"
        )

    print("Loading BioMistral model...")

    llm = Llama(
        model_path=str(MODEL_PATH),
        n_ctx=2048,
        n_threads=6,
        n_batch=128,
        n_gpu_layers=0,
        use_mmap=True,
        verbose=True,
    )

    print("Model loaded successfully.")
    print("Generating response...")

    prompt = """
You are a medical literature assistant.

Question:
What is hypertension?

Answer briefly using general medical knowledge:
"""

    response = llm(
        prompt,
        max_tokens=120,
        temperature=0.2,
        top_p=0.9,
        repeat_penalty=1.1,
        stop=["Question:", "</s>"],
        echo=False,
    )

    answer = response["choices"][0]["text"].strip()

    print("\nBioMistral response:\n")
    print(answer)


if __name__ == "__main__":
    main()