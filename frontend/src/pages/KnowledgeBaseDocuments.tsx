import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import type {
  DocumentStatus,
  KnowledgeBaseDocument,
} from "../api/types";

interface KnowledgeBaseDocumentsProps {
  documents: KnowledgeBaseDocument[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

const statusLabels: Record<DocumentStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Ready",
  FAILED: "Failed",
};

const statusStyles: Record<DocumentStatus, string> = {
  PENDING: "border-[#D6CEC3] bg-[#EEE8E0] text-[#706B64]",
  PROCESSING: "border-[#D8B56A] bg-[#F8F0DA] text-[#755819]",
  COMPLETED: "border-[#AAB99A] bg-[#E8EBDD] text-[#435638]",
  FAILED: "border-[#D7A18D] bg-[#F7E3D9] text-[#8B3518]",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function KnowledgeBaseDocuments({
  documents,
  loading,
  error,
  onRefresh,
}: KnowledgeBaseDocumentsProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "ALL">(
    "ALL",
  );

  const counts = useMemo(
    () => ({
      ALL: documents.length,
      PENDING: documents.filter((document) => document.status === "PENDING")
        .length,
      PROCESSING: documents.filter(
        (document) => document.status === "PROCESSING",
      ).length,
      COMPLETED: documents.filter((document) => document.status === "COMPLETED")
        .length,
      FAILED: documents.filter((document) => document.status === "FAILED")
        .length,
    }),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesStatus =
        statusFilter === "ALL" || document.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        document.originalFilename.toLowerCase().includes(normalizedQuery) ||
        document.uploadedBy.name.toLowerCase().includes(normalizedQuery) ||
        document.uploadedBy.email.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [documents, query, statusFilter]);

  const filters: Array<DocumentStatus | "ALL"> = [
    "ALL",
    "COMPLETED",
    "PROCESSING",
    "PENDING",
    "FAILED",
  ];

  return (
    <section className="border border-[#D6CEC3] bg-[#F8F5F0]">
      <div className="flex flex-col gap-4 border-b border-[#D6CEC3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="mono-label text-[9px] text-[#C85A32]">
            Knowledge base / Inventory
          </p>
          <h2 className="display-font mt-2 text-3xl">Your documents</h2>
          <p className="mt-1 text-xs text-[#706B64]">
            {documents.length} {documents.length === 1 ? "document" : "documents"}{" "}
            uploaded
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-[#D6CEC3] px-3 py-2 text-xs font-semibold text-[#706B64] transition hover:border-[#171614] hover:text-[#171614]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-[#D6CEC3] sm:grid-cols-5">
        {filters.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={`border-b border-r border-[#D6CEC3] px-4 py-4 text-left transition last:border-r-0 sm:border-b-0 ${statusFilter === status ? "bg-[#EEE8E0]" : "hover:bg-[#F4F0EA]"}`}
          >
            <span className="mono-label block text-[8px] text-[#8A8177]">
              {status === "ALL" ? "All documents" : statusLabels[status]}
            </span>
            <span className="mt-1 block text-xl font-semibold">
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-[#D6CEC3] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <label className="relative block w-full sm:max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents or uploader"
            aria-label="Search documents or uploader"
            className="w-full border border-[#D6CEC3] bg-[#F4F0EA] py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-[#8A8177] focus:border-[#C85A32]"
          />
        </label>
        <span className="text-[10px] text-[#8A8177]">
          Showing {filteredDocuments.length} of {documents.length}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="m-4 flex items-start gap-2 border border-[#D7A18D] bg-[#F7E3D9] px-4 py-3 text-xs text-[#8B3518] sm:m-6"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#D6CEC3] bg-[#F4F0EA]">
              <th className="px-5 py-3 font-normal sm:px-6">
                <span className="mono-label text-[8px] text-[#8A8177]">
                  Document
                </span>
              </th>
              <th className="px-4 py-3 font-normal">
                <span className="mono-label text-[8px] text-[#8A8177]">
                  Type / Size
                </span>
              </th>
              <th className="px-4 py-3 font-normal">
                <span className="mono-label text-[8px] text-[#8A8177]">
                  Uploaded by
                </span>
              </th>
              <th className="px-4 py-3 font-normal">
                <span className="mono-label text-[8px] text-[#8A8177]">
                  Date added
                </span>
              </th>
              <th className="px-5 py-3 font-normal sm:px-6">
                <span className="mono-label text-[8px] text-[#8A8177]">
                  Status
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CEC3]">
            {loading && documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <LoaderCircle
                    size={18}
                    className="mx-auto animate-spin text-[#C85A32]"
                  />
                  <p className="mt-3 text-xs text-[#706B64]">
                    Loading knowledge base…
                  </p>
                </td>
              </tr>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <tr key={document.id} className="align-top hover:bg-[#F4F0EA]">
                  <td className="max-w-[280px] px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <FileText
                        size={16}
                        className="mt-0.5 shrink-0 text-[#C85A32]"
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate text-xs font-semibold text-[#171614]"
                          title={document.originalFilename}
                        >
                          {document.originalFilename}
                        </p>
                        {document.status === "FAILED" &&
                          document.errorMessage && (
                            <p
                              className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#8B3518]"
                              title={document.errorMessage}
                            >
                              {document.errorMessage}
                            </p>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#706B64]">
                    <span className="block">{document.contentType}</span>
                    <span className="mt-1 block text-[10px] text-[#8A8177]">
                      {formatBytes(document.fileSizeBytes)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="block text-xs text-[#171614]">
                      {document.uploadedBy.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#8A8177]">
                      {document.uploadedBy.email}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#706B64]">
                    <span className="block">{formatDate(document.createdAt)}</span>
                    {document.updatedAt !== document.createdAt && (
                      <span className="mt-1 block text-[10px] text-[#8A8177]">
                        Updated {formatDate(document.updatedAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold ${statusStyles[document.status]}`}
                    >
                      {document.status === "COMPLETED" ? (
                        <CheckCircle2 size={12} />
                      ) : document.status === "PROCESSING" ? (
                        <LoaderCircle size={12} className="animate-spin" />
                      ) : document.status === "PENDING" ? (
                        <Clock3 size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {statusLabels[document.status]}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <p className="text-sm font-semibold text-[#171614]">
                    {error && documents.length === 0
                      ? "Documents are unavailable"
                      : documents.length === 0
                      ? "No documents uploaded yet"
                      : "No matching documents"}
                  </p>
                  <p className="mt-2 text-xs text-[#706B64]">
                    {error && documents.length === 0
                      ? "Refresh to try loading the knowledge base again."
                      : documents.length === 0
                      ? "Upload a PDF above to start building your knowledge base."
                      : "Try another search or status filter."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
