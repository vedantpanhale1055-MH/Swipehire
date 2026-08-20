"use client";

import styles from "./FiltersPanel.module.css";

const JOB_TYPES = [
  { value: "", label: "Any type" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const CITIES = [
  { value: "", label: "Anywhere in India" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Pune", label: "Pune" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Delhi", label: "Delhi" },
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Chennai", label: "Chennai" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Ahmedabad", label: "Ahmedabad" },
];

const WORK_MODES = [
  { value: "", label: "Any mode" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const PAID_STATUS = [
  { value: "", label: "Paid or unpaid" },
  { value: "paid", label: "Paid only" },
  { value: "unpaid", label: "Unpaid only" },
];

const EMPTY_FILTERS = { jobType: "", city: "", workMode: "", paidStatus: "" };

/**
 * Props:
 *  - filters: { jobType, city, workMode, paidStatus }
 *  - onChange(nextFilters): called with the full updated filters object
 */
export default function FiltersPanel({ filters, onChange }) {
  function update(key, value) {
    const next = { ...filters, [key]: value };
    // Paid/unpaid only makes sense for internships — clear it if the job
    // type changes away from internship.
    if (key === "jobType" && value !== "internship") {
      next.paidStatus = "";
    }
    onChange(next);
  }

  const hasActiveFilters =
    filters.jobType || filters.city || filters.workMode || filters.paidStatus;

  return (
    <div className={styles.bar}>
      <select
        className={styles.select}
        value={filters.jobType}
        onChange={(e) => update("jobType", e.target.value)}
        aria-label="Job type"
      >
        {JOB_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.city}
        onChange={(e) => update("city", e.target.value)}
        aria-label="City"
      >
        {CITIES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.workMode}
        onChange={(e) => update("workMode", e.target.value)}
        aria-label="Work mode"
      >
        {WORK_MODES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {filters.jobType === "internship" && (
        <select
          className={styles.select}
          value={filters.paidStatus}
          onChange={(e) => update("paidStatus", e.target.value)}
          aria-label="Paid or unpaid"
        >
          {PAID_STATUS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}