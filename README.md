# Enterprise Knowledge & Support Assistant

An AI-powered enterprise knowledge assistant that helps employees find
accurate, document-grounded answers to internal policies and
organizational information. Administrators can upload knowledge
documents, which are processed, chunked, embedded, and indexed for
retrieval. Employees can then ask questions in a conversational
interface and receive answers generated from relevant knowledge sources.

> **Project status:** Core application, authentication, document
> ingestion, vector retrieval, and conversational RAG are implemented.
> Advanced RAG enhancements are in progress. The README distinguishes
> implemented capabilities from planned work; update the status as each
> enhancement is completed and verified.

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Problem Statement](#problem-statement)
-   [Goals](#goals)
-   [Key Features](#key-features)
-   [Application Workflow](#application-workflow)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Implementation Status](#implementation-status)
-   [Advanced RAG Roadmap](#advanced-rag-roadmap)
-   [Repository Structure](#repository-structure)
-   [Prerequisites](#prerequisites)
-   [Configuration](#configuration)
-   [Getting Started](#getting-started)
-   [API Overview](#api-overview)
-   [Data and Storage](#data-and-storage)
-   [Security](#security)
-   [Testing and Validation](#testing-and-validation)
-   [Known Limitations](#known-limitations)
-   [Future Enhancements](#future-enhancements)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Overview

Enterprise Knowledge & Support Assistant is a full-stack application
designed to make internal organizational knowledge easier to access.

Organizations often store policies, procedures, and operational guidance
across multiple PDF files and documents. Employees may have to search
these files manually or ask colleagues for information. This can be
slow, inconsistent, and difficult to scale.

This application provides a conversational interface over an
administrator-managed knowledge base. It uses Retrieval-Augmented
Generation (RAG) to retrieve relevant document passages and provide
answers grounded in those passages, rather than relying only on the
language model's general knowledge.

The application has two primary user experiences:

-   **Administrator:** Uploads and manages the knowledge documents used
    by the assistant.
-   **Employee:** Signs in and asks questions about the available
    organizational knowledge through chat sessions.

## Problem Statement

Enterprise information is frequently distributed across policy
documents, employee handbooks, operational guidelines, and other files.
Finding a specific rule or exception can require manually opening and
searching several documents.

A general-purpose chatbot is not sufficient for this use case: it may
answer from pretrained knowledge, make assumptions, or present
unsupported information as company policy.

The project addresses these challenges by:

1.  Providing a central, searchable knowledge base.
2.  Retrieving relevant passages from uploaded documents for each
    question.
3.  Grounding generated answers in retrieved content.
4.  Maintaining conversational context for follow-up questions.
5.  Restricting access to application features according to user roles.

## Goals

-   Make organizational knowledge accessible through natural-language
    questions.
-   Reduce manual searching across policy documents.
-   Keep responses grounded in available source documents.
-   Support follow-up questions through conversational context.
-   Provide secure administrator and employee workflows.
-   Build a modular foundation for advanced retrieval, tool integration,
    and production deployment.

## Key Features

### Authentication and authorization

-   Google OAuth 2.0 sign-in.
-   Backend-managed authentication flow.
-   Application JWT stored in an HttpOnly cookie.
-   CSRF protection for state-changing API requests.
-   Role-based access for administrators and employees.
-   Configurable administrator email mapping.

### Knowledge-base management

-   Administrator-only PDF upload.
-   PDF validation and a 10 MB upload limit.
-   SHA-256 checksum generation and duplicate detection.
-   Original PDF storage in Supabase Storage.
-   Document metadata and ingestion status tracking.
-   Text extraction using Apache PDFBox.
-   Text chunking with overlap to preserve context.

### Retrieval-Augmented Generation

-   Local text embeddings using
    `sentence-transformers/all-MiniLM-L6-v2`.
-   384-dimensional embeddings.
-   Vector storage and similarity search using PostgreSQL with pgvector.
-   Configurable retrieval count and similarity threshold.
-   Retrieved document metadata included as source context for answer
    generation.
-   System instructions designed to reduce unsupported policy claims and
    unrelated responses.
-   Source-document names included in the assistant's response where
    supported.

### Conversational chat

-   Employee chat sessions.
-   Session ownership checks.
-   Persistent user and assistant messages.
-   Conversation history supplied to the AI service.
-   Follow-up question support through query rewriting.
-   AI responses generated using retrieved knowledge and conversation
    context.

### Advanced RAG

The advanced retrieval phase is being developed on top of the working
basic RAG pipeline. The current implementation includes metadata-filter
support and conversation-aware query rewriting. Additional retrieval
improvements are planned in the roadmap below.

## Application Workflow

### Document ingestion

1.  An administrator uploads a PDF.
2.  The backend validates the file and calculates its SHA-256 checksum.
3.  The original file is stored in Supabase Storage.
4.  Document metadata is saved with an initial `PENDING` status.
5.  The ingestion process downloads the PDF and extracts its text.
6.  Extracted text is split into overlapping chunks.
7.  Each chunk is enriched with metadata such as document ID, chunk
    index, and source filename.
8.  Spring AI generates embeddings locally.
9.  The chunks and embeddings are stored in the Supabase PostgreSQL
    database using pgvector.
10. The document status is updated to `COMPLETED` or `FAILED`.

### Question answering

1.  An employee submits a question in a chat session.
2.  The backend persists the user's message and loads the session
    history.
3.  The query-rewriting service converts context-dependent follow-up
    questions into standalone retrieval queries.
4.  The retrieval service searches the vector store for relevant chunks.
5.  Retrieved content is assembled into a knowledge context.
6.  The AI service sends the system instructions, conversation history,
    and retrieved context to the chat model.
7.  The generated answer is persisted and returned to the frontend.

``` mermaid
flowchart TD
    A[Administrator uploads PDF] --> B[Validate file and calculate checksum]
    B --> C[Store PDF in Supabase Storage]
    C --> D[Save document metadata]
    D --> E[Extract text with PDFBox]
    E --> F[Split text into chunks]
    F --> G[Generate local embeddings]
    G --> H[Store chunks and vectors in pgvector]

    I[Employee asks a question] --> J[Load conversation history]
    J --> K[Rewrite query using conversation context]
    K --> L[Retrieve relevant chunks]
    L --> M[Build knowledge context]
    M --> N[Generate grounded answer with Groq]
    N --> O[Persist and return response]
```

## Technology Stack

  Area                         Technology
  ---------------------------- ------------------------------------------------
  Frontend                     React, TypeScript, Vite
  Styling                      Tailwind CSS
  Backend                      Java, Spring Boot, Maven
  AI integration               Spring AI 2.0.1
  Chat model                   Groq API --- `openai/gpt-oss-120b`
  Embedding model              `sentence-transformers/all-MiniLM-L6-v2`
  Embedding execution          Spring AI Transformers (ONNX, local inference)
  Vector database              PostgreSQL with pgvector
  Database platform            Supabase
  Object/file storage          Supabase Storage
  Authentication               Google OAuth 2.0, Spring Security
  Application authentication   JWT in an HttpOnly cookie
  CSRF protection              Spring Security CSRF
  PDF processing               Apache PDFBox 3.x
  Build tool                   Maven
  Version control              Git

## Architecture

The application is organized into a React frontend and a Spring Boot
backend.

-   **Frontend:** Provides authentication screens, protected application
    routes, administrator document upload, and employee chat
    experiences.
-   **Backend API:** Handles authentication, authorization, document
    management, chat sessions, message persistence, retrieval, and AI
    orchestration.
-   **AI layer:** Separates query rewriting, knowledge retrieval, and
    answer generation into dedicated services.
-   **Supabase:** Provides relational persistence, vector storage
    through pgvector, and original PDF storage.

The backend follows a Backend-for-Frontend (BFF)-style authentication
flow: Google OAuth is handled by the backend, which issues the
application's JWT cookie to the browser.

## Implementation Status

The following reflects the implementation state recorded for this
project. A feature marked implemented should still be re-tested when
making significant changes.

  -----------------------------------------------------------------------
  Component               Status                  Notes
  ----------------------- ----------------------- -----------------------
  React + TypeScript +    Implemented             Tailwind CSS is used
  Vite frontend                                   for styling
  foundation                                      

  Google OAuth login      Implemented             Backend-managed OAuth
                                                  flow

  JWT cookie              Implemented             HttpOnly `ACCESS_TOKEN`
  authentication                                  cookie

  CSRF protection         Implemented             CSRF token endpoint and
                                                  protected unsafe
                                                  requests

  Role-based API access   Implemented             Configured admin email
                                                  maps to `ADMIN`; other
                                                  users map to `EMPLOYEE`

  Chat sessions and       Implemented             Session ownership is
  message persistence                             enforced

  PDF upload and          Implemented             PDF validation, 10 MB
  validation                                      limit, checksum-based
                                                  duplicate detection

  Supabase Storage        Implemented             Stores original
  integration                                     uploaded PDFs

  PDF text extraction     Implemented             Apache PDFBox;
                                                  image-only scanned PDFs
                                                  are not OCR-processed

  Document chunking       Implemented             Character-based chunks
                                                  with overlap

  Local embedding         Implemented             MiniLM model, 384
  generation                                      dimensions

  pgvector storage        Implemented             Supabase PostgreSQL
                                                  vector store

  Basic semantic          Implemented and tested  Similarity search
  retrieval                                       through Spring AI

  Grounded answer         Implemented and tested  Groq chat model with
  generation                                      retrieved context

  Metadata-filter support Implemented in code     `documentId` filter
                                                  compiles; runtime
                                                  behavior requires
                                                  dedicated verification

  Conversation-aware      Integrated and tested   Follow-up query
  query rewriting                                 rewritten using chat
                                                  history

  Hybrid search           Planned next            Combine semantic and
                                                  keyword retrieval

  Reranking               Planned                 Improve ordering of
                                                  retrieved candidates

  Context optimization    Planned                 Deduplicate and
                                                  optimize retrieved
                                                  context

  Evaluation and          Planned                 Measure retrieval and
  observability                                   answer quality
  -----------------------------------------------------------------------

### Current advanced RAG progress

The advanced RAG phase builds on the working ingestion and
question-answering pipeline.

1.  **Metadata filtering:** The retrieval service supports an optional
    document ID filter using Spring AI's search filter expression.
    Runtime behavior still needs a dedicated test.
2.  **Query rewriting:** Implemented and tested. Follow-up questions are
    rewritten into standalone search queries using conversation history.
    If rewriting fails or returns an empty result, the service falls
    back to the original question.
3.  **Hybrid search:** Next implementation step.
4.  **Reranking:** Planned after hybrid retrieval.
5.  **Context optimization and deduplication:** Planned after reranking.

The remaining advanced RAG steps should be marked complete here only
after implementation and validation.

## Advanced RAG Roadmap

  -----------------------------------------------------------------------
  Step                    Enhancement             Purpose
  ----------------------- ----------------------- -----------------------
  1                       Metadata filtering      Narrow retrieval using
                                                  document metadata and
                                                  support more targeted
                                                  searches

  2                       Query rewriting         Resolve references in
                                                  follow-up questions and
                                                  improve retrieval
                                                  queries

  3                       Hybrid search           Combine vector
                                                  similarity with
                                                  keyword-based full-text
                                                  search

  4                       Reranking               Reorder retrieved
                                                  candidates by relevance
                                                  to the original
                                                  question

  5                       Context optimization    Remove duplicate or
                                                  low-value chunks and
                                                  fit useful context into
                                                  the model prompt
  -----------------------------------------------------------------------

## Repository Structure

The repository is expected to contain separate frontend and backend
applications. Adjust this example to match the actual directory names in
the repository.

``` text
enterprise-knowledge-support-assistant/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── context/
│   │   └── services/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/enterprise/assistant/backend/
│   │   │   │       ├── ai/
│   │   │   │       ├── auth/
│   │   │   │       ├── chat/
│   │   │   │       ├── knowledge/
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

## Prerequisites

Install or provision the following before running the application:

-   Java version compatible with the backend's Spring Boot
    configuration.
-   Maven.
-   Node.js and npm.
-   A Supabase project with PostgreSQL and the pgvector extension
    available.
-   A Supabase Storage bucket named `knowledge-base`.
-   Google OAuth 2.0 credentials.
-   A Groq API key with access to the configured chat model.

The local embedding model is managed by the Spring AI Transformers
integration. The first model initialization may require downloading
model artifacts, depending on the runtime environment and cache state.

## Configuration

Do not commit credentials, private keys, or production secrets. Supply
environment-specific values through environment variables or a secrets
manager.

The backend configuration uses the following application settings. Exact
database and Supabase property names depend on the project's current
configuration.

  -----------------------------------------------------------------------
  Variable / setting                  Purpose
  ----------------------------------- -----------------------------------
  `GROQ_API_KEY`                      API key used for Groq chat
                                      completions

  `app.jwt.secret`                    Secret used to sign application
                                      JWTs; use a strong secret

  `app.jwt.expiration-ms`             Application JWT lifetime in
                                      milliseconds

  Admin email setting                 Email address mapped to the `ADMIN`
                                      role

  Google OAuth client ID              Google OAuth application client ID

  Google OAuth client secret          Google OAuth application client
                                      secret

  Supabase database URL               PostgreSQL connection URL

  Supabase database username/password Database credentials

  Supabase project URL and service    Used by the Supabase Storage
  key                                 integration, if configured that way
  -----------------------------------------------------------------------

The AI-related configuration currently follows this pattern:

``` yaml
spring:
  ai:
    model:
      embedding: transformers
    openai:
      api-key: ${GROQ_API_KEY}
      base-url: https://api.groq.com/openai/v1
      chat:
        options:
          model: openai/gpt-oss-120b
    vectorstore:
      pgvector:
        initialize-schema: true
        dimensions: 384
        distance-type: COSINE_DISTANCE
        index-type: HNSW

app:
  retrieval:
    similarity-threshold: 0.0
```

The OpenAI-compatible Spring AI chat client is configured to use Groq as
its API provider. Embeddings are generated locally by the Transformers
model; they are not generated through the Groq chat endpoint.

> Keep the embedding dimension consistent with the configured embedding
> model and the PostgreSQL vector column. The current model produces
> 384-dimensional embeddings.

## Getting Started

The commands below assume the example `frontend/` and `backend/`
directory names shown above. Update them if your repository uses a
different layout.

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd enterprise-knowledge-support-assistant
```

### 2. Configure Supabase

1.  Create or select a Supabase project.
2.  Ensure the PostgreSQL `vector` extension is available.
3.  Configure the backend database connection.
4.  Create a Storage bucket named `knowledge-base`.
5.  Configure the credentials required by the backend.

### 3. Configure Google OAuth

Create OAuth credentials in Google Cloud Console and configure the
backend's OAuth client ID, client secret, and redirect URI. The redirect
URI must match the callback route configured by the Spring Security
OAuth2 client in this application.

### 4. Configure backend environment variables

Provide the Groq API key, JWT signing secret, OAuth credentials,
database credentials, and Supabase Storage configuration using the names
expected by your application configuration.

### 5. Run the backend

``` bash
cd backend
./mvnw spring-boot:run
```

On Windows:

``` powershell
mvnw.cmd spring-boot:run
```

If the project does not include the Maven wrapper, use:

``` bash
mvn spring-boot:run
```

### 6. Run the frontend

In a separate terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite prints the local development URL after startup. Open that URL in a
browser.

### 7. Try the application

1.  Sign in using Google.
2.  Sign in with the configured administrator account to access
    knowledge-base upload functionality.
3.  Upload a supported PDF document.
4.  Wait for ingestion to complete.
5.  Sign in as an employee and ask a question related to the uploaded
    document.
6.  Ask a follow-up question to exercise conversation-aware query
    rewriting.

## API Overview

The following routes are based on the implemented backend endpoints
described in this project.

  -----------------------------------------------------------------------------
  Method                  Endpoint                      Purpose
  ----------------------- ----------------------------- -----------------------
  `GET`                   `/api/auth/csrf`              Obtain a CSRF token

  `GET`                   `/api/auth/me`                Retrieve the
                                                        authenticated user's
                                                        information

  `POST`                  `/api/auth/logout`            Log out of the
                                                        application

  `POST`                  `/api/admin/knowledge-base`   Upload one or more PDF
                                                        knowledge documents
  -----------------------------------------------------------------------------

Chat and session endpoints are also part of the application. Add their
exact method and path mappings here from the current controller
definitions rather than documenting guessed routes.

All `/api/admin/**` endpoints are restricted to administrators. Employee
chat endpoints are protected according to the configured
employee/administrator authorization rules.

## Data and Storage

The application uses Supabase for both structured data and
document/vector storage.

-   **Relational database:** Stores application data such as users,
    knowledge-document metadata, chat sessions, and messages.
-   **Supabase Storage:** Stores the original uploaded PDF files in the
    `knowledge-base` bucket.
-   **pgvector:** Stores document chunks, embeddings, and associated
    metadata in the vector store.

The vector metadata includes fields such as:

-   `documentId`
-   `chunkIndex`
-   `source`

These fields support source attribution and metadata-based retrieval.

## Security

Security controls currently include:

-   Google OAuth authentication.
-   Backend-issued JWT stored in an HttpOnly cookie.
-   CSRF protection for unsafe API requests.
-   Role-based authorization for administrator and employee API areas.
-   Ownership validation when accessing chat sessions.
-   Server-side PDF validation and duplicate detection.
-   Separation of application secrets from source control.

### Knowledge-grounding behavior

The assistant's system instructions are designed to:

-   Answer enterprise-policy questions using information supported by
    retrieved knowledge.
-   Avoid filling gaps with assumptions or general pretrained knowledge.
-   State when the available documents do not contain sufficient
    information.
-   Avoid interpreting the absence of a rule as permission or
    prohibition.
-   Identify conflicting document statements where they are retrieved.
-   Treat retrieved document text as untrusted content rather than
    executable instructions.

These prompt-level safeguards improve answer discipline but do not
guarantee that a language model will never produce an incorrect answer.
Retrieval quality and generated responses should be evaluated
continuously.

## Testing and Validation

The implemented pipeline has been exercised with sample workplace policy
PDFs, including attendance, work-from-home dress code, workplace, and
return-to-office policy documents.

Validation performed so far includes:

-   PDF upload and metadata persistence.
-   Text extraction and chunk creation.
-   Local embedding generation and pgvector storage.
-   Semantic retrieval against uploaded policy documents.
-   Answer generation through the Groq chat model.
-   Questions where the available documents do not contain the requested
    information.
-   Conversation-aware query rewriting for follow-up questions.

Additional validation recommended:

-   Verify metadata filtering against known document IDs at runtime.
-   Compare semantic-only retrieval with hybrid retrieval after it is
    implemented.
-   Test ambiguous, multi-topic, and out-of-scope questions.
-   Test conflicting policies and documents with missing information.
-   Add automated tests for ingestion, retrieval, authorization, and
    chat workflows.

## Known Limitations

-   Scanned/image-only PDFs are not OCR-processed; text extraction
    requires extractable PDF text.
-   Retrieval quality depends on document quality, chunking, embeddings,
    and search configuration.
-   The current chat history is loaded in full; a bounded history window
    or token-aware strategy is a future improvement.
-   Metadata filtering is implemented in the retrieval service but still
    needs dedicated runtime verification.
-   Query rewriting has fallback behavior, but its output should
    continue to be evaluated for intent preservation.
-   Prompt instructions reduce unsupported answers but cannot provide a
    formal guarantee against hallucinations.
-   Hybrid search, reranking, and context optimization remain planned
    until implemented and tested.

## Future Enhancements

After completing the advanced RAG retrieval pipeline, the planned
project direction includes:

1.  **Conversational memory improvements:** Add a bounded history
    strategy and better handling of long conversations.
2.  **Tool calling:** Allow the assistant to invoke explicitly defined
    backend capabilities when a user request requires an action or
    structured lookup.
3.  **Model Context Protocol (MCP):** Explore exposing selected tools
    and enterprise capabilities through MCP.
4.  **Retrieval security and RBAC:** Enforce document-level access
    controls during retrieval so users can only retrieve information
    they are authorized to access.
5.  **Evaluation and observability:** Add retrieval metrics,
    answer-quality evaluation, tracing, latency monitoring, and
    structured logging.
6.  **AWS deployment:** Containerize and deploy the application using
    appropriate AWS services, with secure configuration and operational
    monitoring.
7.  **Production hardening:** Add automated test coverage, rate
    limiting, resilience, file-processing safeguards, and operational
    error handling.

## Contributing

Contributions and suggestions are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Make focused changes and add tests where applicable.
4.  Run the relevant backend and frontend checks.
5.  Submit a pull request describing the change.

For significant architectural changes, open an issue or discussion
before implementation.

## License

No license has been specified yet. Unless a license is added to this
repository, the project should be treated as having no explicit
open-source reuse permissions.

------------------------------------------------------------------------

*Built as a practical exploration of enterprise AI application
development, Spring AI, Retrieval-Augmented Generation, vector search,
and secure full-stack engineering.*
