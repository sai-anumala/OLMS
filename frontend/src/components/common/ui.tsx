import type { ReactNode } from "react";
import { IoNavigateCircleOutline } from "react-icons/io5";

// Small presentational building blocks shared by many pages

export function Spinner({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: fullScreen ? "100vh" : "50vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "danger";
};

export function EmptyState({ title, message, actionLabel, onAction, tone = "default" }: EmptyStateProps) {
  return (
    <div className="d-flex justify-content-center align-items-center text-center px-3 empty-state">
      <div className="card shadow-sm p-3 p-sm-4 w-100" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <h5 className={`fw-bold mb-2 ${tone === "danger" ? "text-danger" : ""}`}>{title}</h5>
          {message && <p className="text-muted mb-3">{message}</p>}
          {actionLabel && onAction && (
            <button className="btn btn-success btn-sm shadow-sm" onClick={onAction}>
              {actionLabel} <IoNavigateCircleOutline className="fs-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type PageHeaderProps = { title: string; subtitle?: string; action?: ReactNode };

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="border rounded-2 p-3 p-md-4 my-3 d-flex flex-column flex-sm-row gap-3 align-items-sm-center justify-content-between text-start">
      <div>
        <h2 className="h3 mb-1">{title}</h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type StatCardProps = { icon: ReactNode; label: string; value: ReactNode };

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body d-flex align-items-center gap-3 text-start">
        <span className="fs-2 lh-1 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-muted small text-truncate">{label}</div>
          <div className="fs-4 fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}
