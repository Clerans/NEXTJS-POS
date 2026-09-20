"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Calendar, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export interface ReportMetric {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ReportColumn<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface ReportViewProps<T> {
  title: string;
  subtitle: string;
  metrics?: ReportMetric[];
  columns: ReportColumn<T>[];
  data: T[];
  filterOptions?: {
    label: string;
    options: { label: string; value: string }[];
    onFilterChange?: (val: string) => void;
  };
}

export function ReportView<T>({
  title,
  subtitle,
  metrics = [],
  columns,
  data,
  filterOptions,
}: ReportViewProps<T>) {
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");

  const handleExport = () => {
    toast.success(`Exporting "${title}" report to Excel CSV...`);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <div className="page-head-row">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-sub">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-patina" /> Print Report
          </Button>
          <Button variant="orange" onClick={handleExport} className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Date Filter & Control Bar */}
      <div className="card bg-white p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-dark">
            <Calendar className="w-4 h-4 text-patina" /> Date Range:
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-36 py-1.5 text-xs"
          />
          <span className="text-xs text-text-gray font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input w-36 py-1.5 text-xs"
          />
          <Button
            size="sm"
            variant="default"
            onClick={() => toast.info(`Report filtered for ${startDate} to ${endDate}`)}
            className="text-xs font-bold"
          >
            Apply Filter
          </Button>
        </div>

        {filterOptions && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-gray font-bold">{filterOptions.label}:</span>
            <select
              className="select text-xs font-semibold py-1.5"
              onChange={(e) => filterOptions.onFilterChange?.(e.target.value)}
            >
              {filterOptions.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metric Summary Cards */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="card bg-white p-4 rounded-xl border border-border">
              <div className="text-xs font-semibold text-text-gray mb-1">{m.label}</div>
              <div
                className={`text-xl font-black ${
                  m.highlight ? "text-patina" : "text-text-dark"
                }`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Table Card */}
      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Statement Records</div>
          <div className="text-xs text-text-gray">Showing {data.length} entries</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-patina-light/50">
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-xs text-text-gray"
                >
                  No records matching the period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
