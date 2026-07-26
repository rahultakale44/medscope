# MedScope

**Evidence-grounded medical literature retrieval system**

MedScope is a local RAG (Retrieval-Augmented Generation) application for medical research. Upload trusted PDF documents, retrieve relevant evidence using semantic search, and generate source-backed answers with BioMistral-7B.

## 🎯 Features

- **PDF Ingestion**: Upload medical literature (up to 25MB)
- **Semantic Search**: PubMedBERT embeddings for medical domain
- **Vector Database**: Qdrant for efficient similarity search
- **Local LLM**: BioMistral-7B GGUF for evidence-grounded answers
- **Source Citations**: Every answer includes document sources, page numbers, and similarity scores
- **Premium UI**: Modern React dashboard with dark medical theme
- **Private & Local**: All processing happens on your machine

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  React Frontend (Vite)                          │
│  localhost:5173                                 │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  FastAPI Backend                                │
│  127.0.0.1:8000                                 │
│                                                 │
│  ├─ PDF Parser (PyMuPDF)                       │
│  ├─ Text Splitter (LangChain)                  │
│  ├─ PubMedBERT Embeddings                      │
│  ├─ BioMistral-7B (llama-cpp-python)           │
│  └─ RAG Service                                 │
└─────┬──────────────────────────────┬────────────┘
      │                              │
┌─────▼──────────────────┐  ┌────────▼────────────┐
│  Qdrant Vector DB      │  │  BioMistral Model   │
│  localhost:6333        │  │  (GGUF Format)      │
│  (Docker)              │  │                     │
└────────────────────────┘  └─────────────────────┘
```

## 📦 Tech Stack

### Backend
- Python 3.10+
- FastAPI
- Qdrant (vector database)
- PubMedBERT (`NeuML/pubmedbert-base-embeddings`)
- BioMistral-7B (GGUF, quantized)
- llama-cpp-python
- PyMuPDF (PDF parsing)
- LangChain (text splitting)

### Frontend
- React 19.2.7
- Vite 8.1.1
- React Router DOM
- Axios
- Lucide React (icons)

## 📁 Project Structure

```
medscope/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI routes
│   │   ├── core/          # Config, prompts
│   │   ├── models/        # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # PDF parser
│   ├── models/            # BioMistral GGUF
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks
│   │   └── styles/        # CSS system
│   └── package.json
├── documents/             # Uploaded PDFs (gitignored)
├── qdrant_storage/        # Vector DB data (gitignored)
└── docker-compose.yml     # Qdrant setup
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **Docker** (for Qdrant)
- **BioMistral-7B GGUF model** (place in `backend/models/`)

### 1. Clone Repository

```powershell
git clone <repository-url>
cd medscope
```

### 2. Setup Backend

#### Create Virtual Environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### Install Dependencies

```powershell
pip install -r requirements.txt
```

#### Configure Environment

Create `backend/.env`:

```env
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=medical_documents
EMBEDDING_MODEL=NeuML/pubmedbert-base-embeddings
```

#### Download BioMistral Model

Place `ggml-model-Q4_K_M.gguf` in `backend/models/` directory.

Model source: [BioMistral-7B GGUF quantized model]

### 3. Setup Frontend

```powershell
cd frontend
npm install
```

Frontend environment (`.env`):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 4. Start Qdrant

From project root:

```powershell
docker-compose up -d
```

Verify Qdrant is running:
- Dashboard: http://localhost:6333/dashboard
- API: http://localhost:6333

### 5. Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be available at:
- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

### 6. Start Frontend

```powershell
cd frontend
npm run dev
```

Frontend will be available at:
- App: http://localhost:5173

## 📖 API Documentation

### Health Endpoints

```
GET  /api/health              # API status
GET  /api/health/embedding    # PubMedBERT status
GET  /api/health/qdrant       # Qdrant status
POST /api/health/qdrant/initialize  # Create collection
```

### Document Endpoints

```
POST   /api/documents/upload  # Upload PDF
GET    /api/documents         # List documents
DELETE /api/documents/{hash}  # Delete document
```

### RAG Endpoints

```
POST /api/chat/retrieve  # Semantic search only
POST /api/chat/query     # RAG with answer generation
```

#### Example Query Request

```json
{
  "question": "What treatment is recommended for hypertension?",
  "top_k": 3,
  "score_threshold": 0.2
}
```

#### Example Query Response

```json
{
  "question": "What treatment is recommended for hypertension?",
  "answer": "According to the uploaded guidelines...",
  "grounded": true,
  "total_sources": 3,
  "sources": [
    {
      "document_name": "hypertension-guidelines-2024.pdf",
      "page_number": 5,
      "chunk_index": 2,
      "score": 0.873
    }
  ],
  "disclaimer": "This response summarizes uploaded medical literature..."
}
```

## 🔧 Usage Workflow

1. **Upload Documents**
   - Navigate to "Upload Documents"
   - Drag & drop or select a medical PDF
   - Wait for processing (extraction, chunking, embedding, indexing)

2. **Ask Questions**
   - Navigate to "Ask MedScope"
   - Enter a question related to uploaded literature
   - Adjust top-k and score threshold in advanced settings
   - Submit and wait for BioMistral inference (30-90 seconds)

3. **View Sources**
   - Review generated answer
   - Check grounding status
   - Inspect source citations with similarity scores

4. **Manage Library**
   - Navigate to "Document Library"
   - Search documents
   - Delete documents (removes vectors from Qdrant)

## ⚙️ Configuration

### Backend Settings

Edit `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    app_name: str = "MedScope"
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "medical_documents"
    embedding_model: str = "NeuML/pubmedbert-base-embeddings"
```

### Frontend Settings

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Qdrant Settings

Edit `docker-compose.yml` to change ports or volumes.

## 🛠️ Troubleshooting

### Backend won't start

- Verify Python 3.10+ is installed
- Check virtual environment is activated
- Ensure all dependencies are installed
- Verify BioMistral model exists at `backend/models/ggml-model-Q4_K_M.gguf`

### Qdrant connection failed

- Check Docker is running: `docker ps`
- Start Qdrant: `docker-compose up -d`
- Verify port 6333 is not blocked

### Frontend can't connect to backend

- Verify backend is running on http://127.0.0.1:8000
- Check CORS settings in `backend/app/main.py`
- Verify `VITE_API_BASE_URL` in frontend `.env`

### Upload fails

- Check file is PDF format
- Ensure file size is under 25MB
- Verify PDF contains extractable text (not scanned images)

### Answer generation is slow

- **Expected behavior**: BioMistral-7B runs on CPU, taking 30-90 seconds
- To speed up: Use GPU acceleration (requires CUDA setup)

### Empty answers

- Check if documents are uploaded and indexed
- Lower score threshold in advanced settings
- Verify question is related to uploaded content

## ⚠️ Medical Disclaimer

**MedScope is intended for medical literature research and educational purposes only.**

This application:
- Does NOT provide medical advice, diagnosis, or treatment
- Does NOT replace consultation with qualified healthcare providers
- Should NOT be used for clinical decision-making
- Summarizes uploaded documents and may contain errors

Always consult licensed healthcare professionals for medical decisions.

## 🔐 Security & Privacy

- **All processing is local** - no data sent to external APIs
- **No authentication** - designed for single-user local use
- **File validation** - accepts PDF only, max 25MB
- **No persistent sessions** - stateless backend

For production deployment, add:
- User authentication
- Rate limiting
- Input sanitization
- HTTPS/TLS
- Access control

## 📊 Performance Notes

- **Embedding Generation**: ~1-2 seconds per document page
- **Vector Search**: ~50-200ms for top-3 results
- **LLM Inference**: 30-90 seconds (CPU, 7B model)
- **Recommended**: 16GB RAM, modern CPU

## 🧪 Testing

Run backend tests:

```powershell
cd backend
pytest
```

Test BioMistral model:

```powershell
python test_model.py
```

## 📝 Development

### Build Frontend for Production

```powershell
cd frontend
npm run build
```

Output: `frontend/dist/`

### Lint Frontend

```powershell
npm run lint
```

### Run Backend in Production

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🚧 Future Improvements

- [ ] Streaming LLM responses
- [ ] GPU acceleration for faster inference
- [ ] Document preview and highlighting
- [ ] Multi-document comparison
- [ ] Export answers to PDF/Markdown
- [ ] Query history
- [ ] Advanced filtering (date, document type)
- [ ] Batch document upload
- [ ] Custom embedding models
- [ ] Fine-tuned medical LLM

## 📄 License

[Add your license here]

## 👥 Contributing

[Add contribution guidelines]

## 🙏 Acknowledgments

- BioMistral-7B by [Mistral AI]
- PubMedBERT by [Microsoft Research]
- Qdrant vector database
- FastAPI framework
- React and Vite teams

---

**Built with ❤️ for medical research**
