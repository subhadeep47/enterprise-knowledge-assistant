import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { CheckCircle2, CloudUpload, FileText, FileUp, Info, LoaderCircle, Trash2 } from "lucide-react";
import { api } from "../api/client";

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}`));
      return [...current, ...list.filter((file) => !seen.has(`${file.name}-${file.size}`))];
    });
    setSuccess("");
    setError("");
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
    setUploading(true); setError(""); setSuccess("");
    try {
      const result = await api.uploadKnowledge(files);
      setSuccess(`${result.uploaded} file${result.uploaded === 1 ? "" : "s"} uploaded successfully. The knowledge base is being updated.`);
      setFiles([]);
    } catch {
      setError("Upload failed. Check your connection and file requirements, then try again.");
    } finally { setUploading(false); }
  };

  return (
    <div className="admin-page">
      <header className="topbar">
        <div><span className="topbar-kicker">ADMINISTRATION</span><h2>Knowledge base</h2></div>
        <div className="admin-badge"><FileUp size={15} /> Admin tools</div>
      </header>
      <div className="admin-content">
        <div className="page-intro">
          <div className="page-intro-icon"><FileUp size={20} /></div>
          <div><h1>Manage your knowledge</h1><p>Upload trusted documents so the assistant can answer employee questions with relevant information.</p></div>
        </div>

        <section className="upload-card">
          <div className="card-heading"><div><h3>Add documents</h3><p>Choose files from your computer or drag them into the area below.</p></div><span className="soft-badge">DOCUMENT INGESTION</span></div>
          <div className={`dropzone ${dragging ? "dropzone--dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
            <div className="upload-icon"><CloudUpload size={25} /></div>
            <h3>Drop your files here</h3>
            <p>or <button className="text-button" onClick={() => fileRef.current?.click()} type="button">browse files</button> from your device</p>
            <span className="file-support">PDF, DOCX, TXT, MD · Multiple files supported</span>
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md" onChange={onFileChange} hidden />
          </div>

          {files.length > 0 && (
            <div className="selected-files">
              <div className="selected-files-heading"><strong>Selected files</strong><span>{files.length} item{files.length === 1 ? "" : "s"}</span></div>
              {files.map((file, index) => (
                <div className="file-row" key={`${file.name}-${file.size}-${index}`}>
                  <div className="file-type-icon"><FileText size={17} /></div>
                  <div className="file-info"><strong>{file.name}</strong><span>{formatBytes(file.size)}</span></div>
                  <button className="icon-button remove-file" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="notice notice--error">{error}</div>}
          {success && <div className="notice notice--success"><CheckCircle2 size={17} />{success}</div>}
          <div className="upload-actions">
            <div className="upload-hint"><Info size={15} /><span>Only upload approved, work-related documents.</span></div>
            <button className="primary-button" onClick={() => void upload()} disabled={!files.length || uploading}>
              {uploading ? <><LoaderCircle className="spin" size={16} /> Uploading…</> : <><CloudUpload size={16} /> Upload documents</>}
            </button>
          </div>
        </section>
        <div className="admin-footnote"><Info size={15} /><p>Uploaded documents may take a short time to become searchable while they are processed and indexed.</p></div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
