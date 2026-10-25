import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  FileText,
  FileUp,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { api } from "../api/client";
import type {
  KnowledgeBaseDocument,
  KnowledgeBaseFile,
} from "../api/types";
import KnowledgeBaseDocuments from "./KnowledgeBaseDocuments";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getUploadSummary(files: KnowledgeBaseFile[]): string {
  const completed = files.filter((file) => file.status === "COMPLETED").length;
  const failed = files.filter((file) => file.status === "FAILED");
  const processing = files.filter(
    (file) => file.status === "PENDING" || file.status === "PROCESSING",
  ).length;

  if (files.length === 0) return "No upload results were returned.";
  if (completed === files.length) {
    return `${files.length} document${files.length === 1 ? "" : "s"} uploaded successfully.`;
  }

  const parts = [`${completed} of ${files.length} documents ready`];
  if (failed.length > 0) {
    parts.push(
      `${failed.length} failed: ${failed.map((file) => file.originalFilename).join(", ")}`,
    );
  }
  if (processing > 0) {
    parts.push(
      `${processing} ${processing === 1 ? "is" : "are"} still processing`,
    );
  }
  return `${parts.join(". ")}.`;
}

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = async () => {
    setLoadingDocuments(true);
    setDocumentsError("");
    try {
      const result = await api.getKnowledgeBaseDocuments();
      setDocuments(result);
    } catch {
      setDocumentsError(
        "Couldn't load the knowledge base. Check the connection and try again.",
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    void refreshDocuments();
  }, []);

  const addFiles = (incoming: FileList | File[]) => {
    const selected = Array.from(incoming);
    const accepted = selected.filter((file) =>
      file.name.toLowerCase().endsWith(".pdf"),
    );
    const oversized = accepted.filter((file) => file.size > MAX_FILE_SIZE);
    const valid = accepted.filter((file) => file.size <= MAX_FILE_SIZE);

    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}`));
      return [
        ...current,
        ...valid.filter((file) => !seen.has(`${file.name}-${file.size}`)),
      ];
    });
    setUploadSuccess("");
    if (accepted.length !== selected.length) {
      setUploadError("Only PDF files can be uploaded.");
    } else if (oversized.length > 0) {
      setUploadError("Each PDF must be 10 MB or smaller.");
    } else {
      setUploadError("");
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  };

  const upload = async () => {
    if (!files.length || uploading) return;
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      const result = await api.uploadKnowledge(files);
      setUploadSuccess(getUploadSummary(result));
      setFiles([]);
      void refreshDocuments();
    } catch {
      setUploadError(
        "Upload failed. Check the file requirements and connection, then try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#171614]">
      <header className="flex min-h-[76px] items-center justify-between border-b border-[#D6CEC3] px-5 sm:px-8">
        <div>
          <p className="mono-label text-[9px] text-[#C85A32]">
            Workspace / Admin
          </p>
          <h1 className="mt-1 text-sm font-semibold">Knowledge base</h1>
        </div>
        <div className="flex items-center gap-2 border border-[#D6CEC3] px-3 py-2 text-[10px] text-[#706B64]">
          <ShieldCheck size={14} className="text-[#C85A32]" />
          <span className="mono-label text-[9px]">Admin tools</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] space-y-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mono-label mb-4 flex items-center gap-3 text-[10px] text-[#C85A32]">
              <span className="h-px w-8 bg-[#C85A32]" />
              Content operations
            </p>
            <h2 className="display-font text-[clamp(2.8rem,6vw,4.8rem)] leading-[.9] tracking-[-.04em]">
              Manage your <em className="text-[#C85A32]">knowledge.</em>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#706B64]">
              Upload approved PDFs and keep track of every document as it is
              processed into the knowledge base.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start border border-[#D6CEC3] bg-[#F8F5F0] px-3 py-2 text-[10px] text-[#706B64] sm:self-auto">
            <FileText size={14} className="text-[#C85A32]" />
            PDF · up to 10 MB each
          </div>
        </div>

        <section className="border border-[#171614] bg-[#F8F5F0]">
          <div className="flex items-start justify-between gap-3 border-b border-[#D6CEC3] p-5 sm:p-6">
            <div>
              <p className="mono-label text-[9px] text-[#C85A32]">
                Ingestion / Upload
              </p>
              <h3 className="display-font mt-2 text-3xl">Add documents</h3>
              <p className="mt-2 text-xs leading-5 text-[#706B64]">
                Select PDFs or drop them here to add them to your knowledge
                base.
              </p>
            </div>
            <FileUp size={20} className="mt-1 text-[#C85A32]" />
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mx-5 mt-5 flex min-h-44 flex-col justify-center border border-dashed p-5 transition sm:mx-6 sm:p-6 ${dragging ? "border-[#C85A32] bg-[#F7E3D9]" : "border-[#B9AFA3] bg-[#F4F0EA] hover:border-[#C85A32]"}`}
          >
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center bg-[#C85A32] text-[#F4F0EA]">
                <CloudUpload size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  Drop your PDF files here
                </h4>
                <p className="mt-1 text-xs text-[#706B64]">
                  or{" "}
                  <button
                    className="font-semibold text-[#C85A32] underline underline-offset-4 hover:text-[#A94321]"
                    onClick={() => fileRef.current?.click()}
                    type="button"
                  >
                    browse files
                  </button>{" "}
                  from your device
                </p>
                <p className="mono-label mt-3 text-[8px] text-[#8A8177]">
                  PDF only · Maximum 10 MB per file
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={onFileChange}
              hidden
            />
          </div>

          {files.length > 0 && (
            <div className="px-5 pt-5 sm:px-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="mono-label text-[9px] text-[#706B64]">
                  Selected files
                </h4>
                <span className="text-xs text-[#706B64]">
                  {files.length} item{files.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="divide-y divide-[#D6CEC3] border border-[#D6CEC3]">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center border border-[#D6CEC3] text-[#C85A32]">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">
                        {file.name}
                      </div>
                      <div className="mt-1 text-[10px] text-[#8A8177]">
                        {formatBytes(file.size)}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      aria-label={`Remove ${file.name}`}
                      className="p-2 text-[#706B64] hover:bg-[#F7E3D9] hover:text-[#A94321]"
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadError && (
            <div
              role="alert"
              className="mx-5 mt-4 flex items-start gap-2 border border-[#C85A32] bg-[#F7E3D9] px-4 py-3 text-xs text-[#8B3518] sm:mx-6"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div
              role="status"
              className="mx-5 mt-4 flex items-start gap-2 border border-[#8B9A76] bg-[#E8EBDD] px-4 py-3 text-xs text-[#34452B] sm:mx-6"
            >
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              {uploadSuccess}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4 border-t border-[#D6CEC3] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[10px] leading-5 text-[#8A8177]">
              Documents may take a short time to process and index.
            </p>
            <button
              onClick={() => void upload()}
              disabled={!files.length || uploading}
              className="inline-flex items-center justify-center gap-2 bg-[#C85A32] px-4 py-3 text-xs font-semibold text-[#F4F0EA] transition hover:bg-[#A94321]"
              type="button"
            >
              {uploading ? (
                <>
                  <LoaderCircle className="animate-spin" size={15} />
                  Uploading…
                </>
              ) : (
                <>
                  <CloudUpload size={15} />
                  Upload documents
                </>
              )}
            </button>
          </div>
        </section>

        <KnowledgeBaseDocuments
          documents={documents}
          loading={loadingDocuments}
          error={documentsError}
          onRefresh={() => void refreshDocuments()}
        />
      </main>
    </div>
  );
}
