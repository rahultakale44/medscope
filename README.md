# MedScope — Local Medical RAG Evidence Engine

MedScope is a local **Retrieval-Augmented Generation (RAG)** application for querying trusted medical PDF documents.

It allows users to upload medical literature, convert the content into vector embeddings, retrieve relevant evidence, and generate grounded answers using a local medical language model.

The complete system runs locally using **FastAPI, React, PubMedBERT, Qdrant, and BioMistral-7B**.

> **Medical Disclaimer:** MedScope is intended for educational and research purposes only. It does not replace professional medical advice, diagnosis, or treatment.

---

## Project Overview

Medical guidelines, research papers, and clinical documents are often long and difficult to search manually.

A normal chatbot does not automatically know the content of locally uploaded PDFs and may generate answers without reliable evidence.

MedScope solves this problem by:

- Uploading trusted medical PDF documents
- Extracting text from PDFs
- Dividing documents into smaller chunks
- Generating medical-domain embeddings
- Storing embeddings in Qdrant
- Retrieving the most relevant document chunks
- Generating answers using BioMistral-7B
- Displaying citations with document name, page number, chunk number, and similarity score

---

## Why This Is a RAG Project

RAG stands for **Retrieval-Augmented Generation**.

MedScope combines two main processes:

### Retrieval

- PubMedBERT converts document chunks into embeddings.
- The user question is also converted into an embedding.
- Qdrant performs semantic similarity search.
- The most relevant medical evidence is retrieved.

### Generation

- Retrieved evidence is added to the LLM prompt.
- BioMistral-7B generates an answer based on the retrieved evidence.
- The answer is returned with citations and similarity scores.

```text
PDF Upload
   ↓
Text Extraction
   ↓
Chunking
   ↓
PubMedBERT Embeddings
   ↓
Qdrant Vector Database
   ↓
User Question
   ↓
Semantic Retrieval
   ↓
Relevant Medical Context
   ↓
BioMistral-7B
   ↓
Grounded Answer + Citations
