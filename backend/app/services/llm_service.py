from functools import lru_cache
from pathlib import Path
from typing import Any

from llama_cpp import Llama

from app.core.prompts import MEDICAL_RAG_PROMPT


class LLMService:
    def __init__(self) -> None:
        self.model_path = Path(
            "models/ggml-model-Q4_K_M.gguf"
        )

        if not self.model_path.exists():
            raise FileNotFoundError(
                "BioMistral model not found at: "
                f"{self.model_path.resolve()}"
            )

        self.model = Llama(
            model_path=str(self.model_path),
            n_ctx=2048,
            n_threads=6,
            n_batch=128,
            n_gpu_layers=0,
            use_mmap=True,
            verbose=False,
        )

    def generate_answer(
        self,
        question: str,
        context: str,
    ) -> str:
        cleaned_question = question.strip()
        cleaned_context = context.strip()

        if not cleaned_question:
            raise ValueError("Question cannot be empty.")

        if not cleaned_context:
            return (
                "The uploaded documents do not contain enough "
                "evidence to answer this question reliably."
            )

        prompt = MEDICAL_RAG_PROMPT.format(
            question=cleaned_question,
            context=cleaned_context,
        )

        response: Any = self.model(
            prompt,
            max_tokens=300,
            temperature=0.1,
            top_p=0.9,
            repeat_penalty=1.1,
            stop=[
                "Question:",
                "Retrieved context:",
                "</s>",
            ],
            echo=False,
        )

        answer = str(
            response["choices"][0]["text"]
        ).strip()

        if not answer:
            return (
                "The uploaded documents do not contain enough "
                "evidence to answer this question reliably."
            )

        return answer


@lru_cache
def get_llm_service() -> LLMService:
    return LLMService()