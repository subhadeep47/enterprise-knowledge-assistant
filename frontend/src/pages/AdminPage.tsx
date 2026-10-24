import { ChangeEvent, DragEvent, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  FileUp,
  Info,
  LoaderCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
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
      return [
        ...current,
        ...list.filter((file) => !seen.has(`${file.name}-${file.size}`)),
      ];
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
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.uploadKnowledge(files);
      const completedFiles = result.filter(
        (file) => file.status === "COMPLETED",
      );
      const failedFiles = result.filter((file) => file.status === "FAILED");
      const pendingFiles =
        result.length - completedFiles.length - failedFiles.length;

      if (completedFiles.length === result.length && result.length > 0) {
        setSuccess(
          `${result.length} file${result.length === 1 ? "" : "s"} uploaded successfully. The knowledge base is being updated.`,
        );
      } else if (result.length === 0) {
        setSuccess("No upload results were returned.");
      } else {
        const failedNames = failedFiles
          .map((file) => file.originalFilename)
          .join(", ");
        const failedMessage =
          failedFiles.length > 0
            ? ` ${failedFiles.length} failed${failedNames ? `: ${failedNames}` : ""}.`
            : "";
        const pendingMessage =
          pendingFiles > 0
            ? ` ${pendingFiles} ${pendingFiles === 1 ? "file is" : "files are"} still processing.`
            : "";

        setSuccess(
          `${completedFiles.length} of ${result.length} files completed successfully.${failedMessage}${pendingMessage}`,
        );
      }
      setFiles([]);
    } catch {
      setError(
        "Upload failed. Check your connection and file requirements, then try again.",
      );
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#171614]">
      <header className="flex min-h-[76px] items-center justify-between border-b border-[#D6CEC3] px-5 sm:px-8">
        <div>
          <p className="mono-label text-[9px] text-[#C85A32]">Workspace / 02</p>
          <h2 className="mt-1 text-sm font-semibold">Knowledge base</h2>
        </div>
        <div className="flex items-center gap-2 border border-[#D6CEC3] px-3 py-2 text-[10px] text-[#706B64]">
          <ShieldCheck size={14} className="text-[#C85A32]" />
          <span className="mono-label text-[9px]">Admin tools</span>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] lg:gap-14 lg:px-12 lg:py-14">
        <section className="flex flex-col justify-between">
          <div>
            <p className="mono-label mb-5 flex items-center gap-3 text-[10px] text-[#C85A32]">
              <span className="h-px w-8 bg-[#C85A32]" />
              Content operations
            </p>
            <h1 className="display-font text-[clamp(3.5rem,7vw,6.4rem)] leading-[.87] tracking-[-.04em]">
              Put your
              <br />
              knowledge
              <br />
              <em className="text-[#C85A32]">to work.</em>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-6 text-[#706B64] sm:text-base">
              Add approved internal documents to give the assistant a reliable
              foundation for employee questions.
            </p>
          </div>
          <div className="mt-12 grid max-w-lg grid-cols-2 border-y border-[#D6CEC3] py-5">
            <div className="pr-5">
              <p className="mono-label text-[9px] text-[#706B64]">
                Accepted formats
              </p>
              <p className="mt-3 text-sm font-semibold">
                PDF · DOCX · TXT · MD
              </p>
            </div>
            <div className="border-l border-[#D6CEC3] pl-5">
              <p className="mono-label text-[9px] text-[#706B64]">
                Recommended
              </p>
              <p className="mt-3 text-sm font-semibold">
                Current, approved docs
              </p>
            </div>
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#8A8177]">
            <Info size={14} className="mt-0.5 shrink-0 text-[#C85A32]" />
            Upload only approved, work-related documents. Access controls should
            also be enforced by the backend.
          </p>
        </section>
        <section className="self-start border border-[#171614] bg-[#F8F5F0]">
          <div className="flex items-start justify-between gap-3 border-b border-[#D6CEC3] p-5 sm:p-6">
            <div>
              <p className="mono-label text-[9px] text-[#C85A32]">
                Ingestion / 01
              </p>
              <h3 className="display-font mt-2 text-3xl">Add documents</h3>
              <p className="mt-2 max-w-sm text-xs leading-5 text-[#706B64]">
                Select one or more files, or drop them in the marked area.
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
            className={`mx-5 mt-5 flex min-h-56 flex-col items-start justify-between border border-dashed p-5 transition sm:mx-6 sm:p-6 ${dragging ? "border-[#C85A32] bg-[#F7E3D9]" : "border-[#B9AFA3] bg-[#F4F0EA] hover:border-[#C85A32]"}`}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-[#C85A32] text-[#F4F0EA]">
              <CloudUpload size={20} />
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-semibold">Drop your files here.</h4>
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
              <p className="mono-label mt-4 text-[8px] text-[#8A8177]">
                PDF / DOCX / TXT / MD · Multiple files
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
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
                          current.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Remove ${file.name}`}
                      className="p-2 text-[#706B64] hover:bg-[#F7E3D9] hover:text-[#A94321]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="mx-5 mt-4 border border-[#C85A32] bg-[#F7E3D9] px-4 py-3 text-xs text-[#8B3518] sm:mx-6">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-5 mt-4 flex items-start gap-2 border border-[#8B9A76] bg-[#E8EBDD] px-4 py-3 text-xs text-[#34452B] sm:mx-6">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              {success}
            </div>
          )}
          <div className="mt-5 flex flex-col gap-4 border-t border-[#D6CEC3] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[10px] leading-5 text-[#8A8177]">
              Files may take a short time to process and index.
            </p>
            <button
              onClick={() => void upload()}
              disabled={!files.length || uploading}
              className="inline-flex items-center justify-center gap-2 bg-[#C85A32] px-4 py-3 text-xs font-semibold text-[#F4F0EA] transition hover:bg-[#A94321]"
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
      </div>
    </div>
  );
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
