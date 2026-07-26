MedScope — Local Medical RAG Evidence Engine

MedScope is a local Retrieval-Augmented Generation (RAG) application for querying trusted medical PDF documents. It allows users to upload medical literature, convert the content into vector embeddings, retrieve relevant evidence, and generate grounded answers using a local medical language model.

The complete system runs locally using FastAPI, React, PubMedBERT, Qdrant, and BioMistral-7B.

Medical disclaimer: MedScope is intended for educational and research purposes only. It does not replace professional medical advice, diagnosis, or treatment.

Project Overview

Medical guidelines, research papers, and clinical documents are often long and difficult to search manually.

A normal chatbot does not automatically know the contents of locally uploaded PDFs and may generate answers without reliable evidence.

MedScope solves this problem by:

extracting text from uploaded medical PDFs

dividing the text into manageable chunks

converting chunks into medical-domain embeddings

storing embeddings in Qdrant

retrieving the most relevant chunks for a question

generating answers using BioMistral-7B

showing citations with document name, page number, chunk number, and similarity score

Why This Is a RAG Project

RAG stands for Retrieval-Augmented Generation.

MedScope combines two major stages:

Retrieval

PubMedBERT converts document chunks and user questions into embeddings.

Qdrant performs semantic similarity search.

The most relevant evidence is retrieved from uploaded PDFs.

Generation

Retrieved evidence is added to the prompt.

BioMistral-7B generates a response grounded in that evidence.

The answer is returned with source citations.

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

Features

Medical PDF Ingestion

Upload PDF documents

Drag-and-drop interface

PDF validation

Text extraction

Automatic chunking

Embedding generation

Qdrant indexing

Duplicate-document handling

Medical Question Answering

Ask questions from uploaded literature

Semantic retrieval

Local BioMistral inference

Grounded answer status

Suggested questions

Loading states for local model inference

Copy answer

Start a new question

Source Citations

Each generated answer may include:

document name

page number

chunk index

similarity score

retrieved evidence text

Document Library

View indexed documents

Search documents

Refresh document list

View page and chunk counts

Delete documents safely

Remove corresponding vectors from Qdrant

System Dashboard

FastAPI service status

Qdrant status

embedding model status

local LLM status

indexed vector count

quick navigation actions

Local and Private

Runs locally

Uses a local GGUF model

Stores vectors locally in Qdrant

No dependency on an external LLM API for generation

Screenshots

Add screenshots to a folder such as:

docs/screenshots/

Suggested screenshots:

Dashboard

Ask MedScope

Upload Documents

Document Library

Grounded answer with citations

Example:

![MedScope Dashboard](docs/screenshots/dashboard.png)

Tech Stack

Frontend

React

Vite

JavaScript

React Router DOM

Axios

Lucide React

CSS

Backend

Python 3.10

FastAPI

Uvicorn

Pydantic

PyMuPDF or PDF parsing utilities

Sentence Transformers

llama-cpp-python

AI and RAG

BioMistral-7B GGUF

PubMedBERT embeddings

Qdrant vector database

semantic similarity retrieval

context-grounded prompt generation

Infrastructure

Docker

Docker Compose

Local file storage

System Architecture

React + Vite Frontend
        |
        | Axios / HTTP
        v
FastAPI Backend
        |
        ├── Document Service
        ├── PDF Parser
        ├── Embedding Service
        ├── Qdrant Service
        ├── RAG Service
        └── LLM Service
                |
                v
        BioMistral-7B GGUF

Vector Storage:
Qdrant

Embedding Model:
PubMedBERT

Project Structure

medscope/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   └── health.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── prompts.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── qdrant_service.py
│   │   │   └── rag_service.py
│   │   ├── utils/
│   │   └── main.py
│   ├── models/
│   │   └── ggml-model-Q4_K_M.gguf
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── test_model.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── documents/
├── qdrant_storage/
├── docker-compose.yml
├── .gitignore
└── README.md

Prerequisites

Install the following:

Python 3.10

Node.js 20 or later

npm

Docker Desktop

Git

Visual Studio C++ Runtime on Windows

at least 16 GB RAM recommended

sufficient storage for the local GGUF model

Installation

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/medscope.git
cd medscope

Replace YOUR_USERNAME with your GitHub username.

2. Start Qdrant

From the project root:

docker compose up -d

Verify the container:

docker ps

Qdrant should be available at:

http://localhost:6333

3. Backend Setup

Move into the backend folder:

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Upgrade pip:

python -m pip install --upgrade pip

Install dependencies:

pip install -r requirements.txt

4. Configure Backend Environment Variables

Create a .env file inside backend.

Example:

APP_NAME=MedScope
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=medical_documents
EMBEDDING_MODEL=NeuML/pubmedbert-base-embeddings
MODEL_PATH=models/ggml-model-Q4_K_M.gguf

Use the actual variable names expected by backend/app/core/config.py.

5. Add the BioMistral Model

Place the GGUF model inside:

backend/models/

Expected file:

ggml-model-Q4_K_M.gguf

Example model path:

backend/models/ggml-model-Q4_K_M.gguf

The model file is large and should not be committed to GitHub.

6. Start the Backend

From the backend folder:

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

Backend URL:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

7. Frontend Setup

Open a new terminal.

Move into the frontend folder:

cd frontend

Install dependencies:

npm install

Create or update frontend/.env:

VITE_API_BASE_URL=http://127.0.0.1:8000/api

Start the frontend:

npm run dev

Frontend URL:

http://localhost:5173

Recommended Startup Order

Always start services in this order:

1. Docker Desktop
2. Qdrant
3. FastAPI backend
4. React frontend

Commands:

Terminal 1 — Qdrant

cd D:\MedScope\medscope
docker compose up -d

Terminal 2 — Backend

cd D:\MedScope\medscope\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

Terminal 3 — Frontend

cd D:\MedScope\medscope\frontend
npm run dev

API Endpoints

Health

GET /api/health

GET /api/health/embedding

GET /api/health/qdrant

POST /api/health/qdrant/initialize

Documents

POST /api/documents/upload

Uploads a PDF using multipart/form-data.

Field name:

file

GET /api/documents

Returns indexed documents.

DELETE /api/documents/{file_hash}

Deletes a document and its vector chunks.

RAG

POST /api/chat/retrieve

Retrieves relevant document chunks.

Example request:

{
  "question": "What treatment is recommended for hypertension?",
  "top_k": 3
}

POST /api/chat/query

Runs the complete RAG pipeline.

Example request:

{
  "question": "What lifestyle changes and medications are recommended for hypertension?",
  "top_k": 3,
  "score_threshold": 0.2
}

Example response:

{
  "question": "What lifestyle changes and medications are recommended for hypertension?",
  "answer": "The uploaded evidence recommends...",
  "grounded": true,
  "total_sources": 3,
  "sources": [
    {
      "document_name": "01_hypertension_overview.pdf",
      "page_number": 1,
      "chunk_index": 1,
      "score": 0.631
    }
  ]
}

Example Workflow

Step 1

Open the Upload Documents page.

Step 2

Upload a trusted medical PDF.

Step 3

Wait for:

text extraction

chunk creation

embedding generation

Qdrant indexing

Step 4

Open Document Library and verify that the document appears.

Step 5

Open Ask MedScope and enter a question.

Example:

What monitoring and lifestyle measures are recommended for managing type 2 diabetes?

Step 6

Review:

grounded answer

cited PDF

page number

chunk number

similarity score

Tested Questions

Hypertension

What lifestyle changes and medications are commonly recommended for managing hypertension?

Type 2 Diabetes

What monitoring and lifestyle measures are recommended for managing type 2 diabetes?

Asthma

What long-term treatment and self-management measures are recommended for asthma?

Antibiotic Stewardship

What principles help ensure the appropriate use of antibiotics?

Cardiovascular Prevention

What lifestyle and medication strategies are used for cardiovascular disease prevention?

Production Build

To verify the frontend build:

cd frontend
npm run build

Expected result:

✓ built in ...

The production files will be created inside:

frontend/dist/

Git Ignore Recommendations

Make sure the following are ignored:

backend/venv/
frontend/node_modules/
frontend/dist/
backend/models/*.gguf
qdrant_storage/
.env
*.pyc
__pycache__/
.vscode/
.DS_Store

Do not commit:

local GGUF model files

virtual environments

node_modules

Qdrant storage

secrets

generated build files unless required

Troubleshooting

Qdrant Configuration File Not Found

Problem:

no configuration file provided: not found

Cause:

docker compose up -d was executed from the wrong folder.

Fix:

cd D:\MedScope\medscope
docker compose up -d

Frontend Port Already in Use

Problem:

Port 5173 is in use

Stop the running Node process:

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Then restart:

cd frontend
npm run dev

Backend Import Error

Problem:

ImportError: cannot import name ...

Check:

service function names

router exports

module paths

__init__.py files

cached singleton function names

llama-cpp Shared Library Error

Problem:

Could not find llama.dll

Possible causes:

incompatible llama-cpp-python wheel

missing runtime dependency

incompatible CUDA build

corrupt installation

A CPU-compatible installation may be used when GPU setup is unavailable.

Slow Answer Generation

Local BioMistral inference may take approximately 30–90 seconds depending on:

hardware

model quantization

prompt size

CPU or GPU configuration

number of retrieved chunks

This is expected for local inference.

Frontend Cannot Reach Backend

Verify:

http://127.0.0.1:8000/docs

Check frontend/.env:

VITE_API_BASE_URL=http://127.0.0.1:8000/api

Restart Vite after changing .env.

Current Working Status

The following flow has been tested successfully:

PDF Upload
→ Text Extraction
→ Chunking
→ PubMedBERT Embeddings
→ Qdrant Indexing
→ Question Submission
→ Semantic Retrieval
→ BioMistral Generation
→ Grounded Answer
→ Source Citations

Verified features:

Dashboard status cards

PDF upload

Document Library

semantic retrieval

BioMistral answer generation

grounded status

source PDF name

page and chunk metadata

similarity score

production frontend build

Future Improvements

authentication and user accounts

conversation history

document collections

document preview

evidence highlighting

reranking model

hybrid keyword and vector search

OCR for scanned PDFs

multi-language support

GPU acceleration

streaming token responses

deployment with Docker

automated evaluation metrics

role-based access

audit logs

support for DOCX and research URLs


should be independently verified before clinical use
