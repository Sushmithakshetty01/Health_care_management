import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  Boxes,
  CheckCircle2,
  ClipboardList,
  PackagePlus,
  RefreshCcw,
  UserRound,
  Wrench,
} from "lucide-react";
import { bedResourceApi, getUser } from "../api/client";

const BED_STATUSES = [
  "available",
  "reserved",
  "occupied",
  "cleaning",
  "maintenance",
];

const RESOURCE_TYPES = [
  "oxygen_cylinder",
  "ventilator",
  "wheelchair",
  "monitor",
  "infusion_pump",
  "stretcher",
];

const emptyBed = {
  bed_number: "",
  ward_type: "General",
  room_number: "",
  floor_number: "",
  status: "available",
  notes: "",
};

const emptyResource = {
  name: "",
  resource_type: "oxygen_cylinder",
  total_quantity: "",
  unit: "units",
  location: "",
  minimum_threshold: "0",
  status: "active",
  notes: "",
};

function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status) {
  const styles = {
    available: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-100 text-emerald-700",
    occupied: "bg-blue-100 text-blue-700",
    reserved: "bg-violet-100 text-violet-700",
    cleaning: "bg-amber-100 text-amber-700",
    maintenance: "bg-orange-100 text-orange-700",
    inactive: "bg-slate-200 text-slate-700",
  };
  return styles[status] || "bg-slate-100 text-slate-700";
}

function SummaryCard({ label, value, detail, icon: Icon, color }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`rounded-2xl p-3 text-white ${color}`}>
          <Icon size={21} />
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export default function BedResourceManagement() {
  const user = getUser();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [summary, setSummary] = useState(null);
  const [beds, setBeds] = useState([]);
  const [resources, setResources] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [bedForm, setBedForm] = useState(emptyBed);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [bedSearch, setBedSearch] = useState("");
  const [bedStatus, setBedStatus] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [assignmentPatients, setAssignmentPatients] = useState({});
  const [resourceActions, setResourceActions] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const requests = [
        bedResourceApi.summary(),
        bedResourceApi.beds({ search: bedSearch, status: bedStatus }),
        bedResourceApi.resources({ search: resourceSearch }),
      ];

      if (isAdmin) {
        requests.push(bedResourceApi.patients(), bedResourceApi.allocations(true));
      }

      const [summaryData, bedData, resourceData, patientData, allocationData] =
        await Promise.all(requests);

      setSummary(summaryData);
      setBeds(bedData);
      setResources(resourceData);
      setPatients(patientData || []);
      setAllocations(allocationData || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function runAction(key, action, successMessage) {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      await loadData();
      return true;
    } catch (actionError) {
      setError(actionError.message);
      return false;
    } finally {
      setBusy("");
    }
  }

  async function submitBed(event) {
    event.preventDefault();
    const succeeded = await runAction(
      "create-bed",
      () =>
        bedResourceApi.createBed({
          ...bedForm,
          floor_number:
            bedForm.floor_number === "" ? null : Number(bedForm.floor_number),
          room_number: bedForm.room_number || null,
          notes: bedForm.notes || null,
      }),
      "Bed created successfully."
    );
    if (succeeded) setBedForm(emptyBed);
  }

  async function submitResource(event) {
    event.preventDefault();
    const succeeded = await runAction(
      "create-resource",
      () =>
        bedResourceApi.createResource({
          ...resourceForm,
          total_quantity: Number(resourceForm.total_quantity),
          minimum_threshold: Number(resourceForm.minimum_threshold || 0),
          location: resourceForm.location || null,
          notes: resourceForm.notes || null,
      }),
      "Resource created successfully."
    );
    if (succeeded) setResourceForm(emptyResource);
  }

  function assignBed(bed) {
    const patientId = assignmentPatients[bed.id];
    if (!patientId) {
      setError("Select a patient before assigning the bed.");
      return;
    }

    runAction(
      `assign-${bed.id}`,
      () => bedResourceApi.assignBed(bed.id, { patient_id: patientId }),
      `${bed.bed_number} assigned successfully.`
    );
  }

  function resourceAction(resource, field, fallback = "") {
    return resourceActions[resource.id]?.[field] ?? fallback;
  }

  function setResourceAction(resourceId, field, value) {
    setResourceActions((current) => ({
      ...current,
      [resourceId]: { ...current[resourceId], [field]: value },
    }));
  }

  function adjustStock(resource) {
    const quantity = Number(resourceAction(resource, "adjustment", 0));
    const reason = resourceAction(resource, "reason");

    if (!quantity || !reason.trim()) {
      setError("Enter a non-zero stock change and a reason.");
      return;
    }

    runAction(
      `adjust-${resource.id}`,
      () =>
        bedResourceApi.adjustResource(resource.id, {
          quantity_change: quantity,
          notes: reason,
        }),
      `${resource.name} stock updated.`
    );
  }

  function allocateResource(resource) {
    const quantity = Number(resourceAction(resource, "quantity", 0));
    const patientId = resourceAction(resource, "patient_id") || null;
    const bedId = resourceAction(resource, "bed_id") || null;

    if (quantity <= 0 || (!patientId && !bedId)) {
      setError("Enter an allocation quantity and select a patient or bed.");
      return;
    }

    runAction(
      `allocate-${resource.id}`,
      () =>
        bedResourceApi.allocateResource(resource.id, {
          quantity,
          patient_id: patientId,
          bed_id: bedId,
          notes: resourceAction(resource, "allocation_notes") || null,
        }),
      `${resource.name} allocated successfully.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-800 p-7 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                Live Hospital Capacity
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Bed & Resource Management
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">
                Track bed occupancy, patient assignments, equipment stock and
                active resource allocations from one operational dashboard.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-800 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total Beds"
            value={summary?.beds?.total || 0}
            detail={`${summary?.beds?.occupancy_percentage || 0}% occupied`}
            icon={BedDouble}
            color="bg-blue-600"
          />
          <SummaryCard
            label="Available"
            value={summary?.beds?.available || 0}
            detail="Ready for assignment"
            icon={CheckCircle2}
            color="bg-emerald-600"
          />
          <SummaryCard
            label="Occupied"
            value={summary?.beds?.occupied || 0}
            detail="Active patient beds"
            icon={UserRound}
            color="bg-violet-600"
          />
          <SummaryCard
            label="Resource Stock"
            value={summary?.resources?.available_quantity || 0}
            detail={`${summary?.resources?.total_types || 0} inventory records`}
            icon={Boxes}
            color="bg-cyan-600"
          />
          <SummaryCard
            label="Low Stock"
            value={summary?.resources?.low_stock_count || 0}
            detail="At or below threshold"
            icon={AlertTriangle}
            color="bg-orange-500"
          />
        </section>

        {isAdmin && (
          <section className="mt-7 grid gap-6 xl:grid-cols-2">
            <form
              onSubmit={submitBed}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center gap-3">
                <BedDouble className="text-blue-600" />
                <h2 className="text-xl font-black text-slate-950">Add Bed</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bed Number">
                  <input
                    required
                    className={inputClass}
                    value={bedForm.bed_number}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, bed_number: event.target.value })
                    }
                    placeholder="ICU-101"
                  />
                </Field>
                <Field label="Ward Type">
                  <input
                    required
                    className={inputClass}
                    value={bedForm.ward_type}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, ward_type: event.target.value })
                    }
                    placeholder="ICU"
                  />
                </Field>
                <Field label="Room Number">
                  <input
                    className={inputClass}
                    value={bedForm.room_number}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, room_number: event.target.value })
                    }
                    placeholder="101"
                  />
                </Field>
                <Field label="Floor">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={bedForm.floor_number}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, floor_number: event.target.value })
                    }
                    placeholder="1"
                  />
                </Field>
                <Field label="Initial Status">
                  <select
                    className={inputClass}
                    value={bedForm.status}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, status: event.target.value })
                    }
                  >
                    {BED_STATUSES.filter((status) => status !== "occupied").map(
                      (status) => (
                        <option key={status} value={status}>
                          {titleCase(status)}
                        </option>
                      )
                    )}
                  </select>
                </Field>
                <Field label="Notes">
                  <input
                    className={inputClass}
                    value={bedForm.notes}
                    onChange={(event) =>
                      setBedForm({ ...bedForm, notes: event.target.value })
                    }
                    placeholder="Optional notes"
                  />
                </Field>
              </div>
              <button
                disabled={busy === "create-bed"}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <BedDouble size={17} />
                Add Bed
              </button>
            </form>

            <form
              onSubmit={submitResource}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center gap-3">
                <PackagePlus className="text-cyan-600" />
                <h2 className="text-xl font-black text-slate-950">Add Resource</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Resource Name">
                  <input
                    required
                    className={inputClass}
                    value={resourceForm.name}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, name: event.target.value })
                    }
                    placeholder="Portable Oxygen Cylinder"
                  />
                </Field>
                <Field label="Type">
                  <select
                    className={inputClass}
                    value={resourceForm.resource_type}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        resource_type: event.target.value,
                      })
                    }
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {titleCase(type)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Total Quantity">
                  <input
                    required
                    type="number"
                    min="0"
                    className={inputClass}
                    value={resourceForm.total_quantity}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        total_quantity: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Low Stock Threshold">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={resourceForm.minimum_threshold}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        minimum_threshold: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputClass}
                    value={resourceForm.location}
                    onChange={(event) =>
                      setResourceForm({
                        ...resourceForm,
                        location: event.target.value,
                      })
                    }
                    placeholder="Central Store"
                  />
                </Field>
                <Field label="Unit">
                  <input
                    required
                    className={inputClass}
                    value={resourceForm.unit}
                    onChange={(event) =>
                      setResourceForm({ ...resourceForm, unit: event.target.value })
                    }
                  />
                </Field>
              </div>
              <button
                disabled={busy === "create-resource"}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-700 disabled:opacity-60"
              >
                <PackagePlus size={17} />
                Add Resource
              </button>
            </form>
          </section>
        )}

        <section className="mt-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">Beds</h2>
              <p className="mt-1 text-sm text-slate-500">
                Live ward status and patient occupancy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                className={inputClass}
                value={bedSearch}
                onChange={(event) => setBedSearch(event.target.value)}
                placeholder="Search bed number"
              />
              <select
                className={inputClass}
                value={bedStatus}
                onChange={(event) => setBedStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                {BED_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
              <button
                onClick={loadData}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Bed</th>
                  <th className="px-4 py-3">Ward / Room</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Patient</th>
                  {isAdmin && <th className="px-4 py-3">Management</th>}
                </tr>
              </thead>
              <tbody>
                {beds.map((bed) => (
                  <tr key={bed.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-4 font-black text-slate-950">
                      {bed.bed_number}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {bed.ward_type}
                      <p className="text-xs text-slate-400">
                        Room {bed.room_number || "-"} / Floor{" "}
                        {bed.floor_number ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                          bed.status
                        )}`}
                      >
                        {titleCase(bed.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {bed.app_users?.full_name || "Not assigned"}
                      {bed.expected_release_at && (
                        <p className="text-xs text-slate-400">
                          Expected:{" "}
                          {new Date(bed.expected_release_at).toLocaleString()}
                        </p>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        {bed.status === "occupied" ? (
                          <button
                            disabled={busy === `release-${bed.id}`}
                            onClick={() =>
                              runAction(
                                `release-${bed.id}`,
                                () => bedResourceApi.releaseBed(bed.id),
                                `${bed.bed_number} released to cleaning.`
                              )
                            }
                            className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-800"
                          >
                            Release Bed
                          </button>
                        ) : ["available", "reserved"].includes(bed.status) ? (
                          <div className="flex gap-2">
                            <select
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                              value={assignmentPatients[bed.id] || ""}
                              onChange={(event) =>
                                setAssignmentPatients({
                                  ...assignmentPatients,
                                  [bed.id]: event.target.value,
                                })
                              }
                            >
                              <option value="">Select patient</option>
                              {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                  {patient.full_name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignBed(bed)}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white"
                            >
                              Assign
                            </button>
                          </div>
                        ) : (
                          <select
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                            value={bed.status}
                            onChange={(event) =>
                              runAction(
                                `status-${bed.id}`,
                                () =>
                                  bedResourceApi.updateBedStatus(
                                    bed.id,
                                    event.target.value
                                  ),
                                "Bed status updated."
                              )
                            }
                          >
                            {BED_STATUSES.filter(
                              (status) => status !== "occupied"
                            ).map((status) => (
                              <option key={status} value={status}>
                                {titleCase(status)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && beds.length === 0 && (
              <p className="py-10 text-center text-sm font-semibold text-slate-400">
                No beds match the current filters.
              </p>
            )}
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">Resources</h2>
              <p className="mt-1 text-sm text-slate-500">
                Equipment inventory, availability and low-stock thresholds.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                className={inputClass}
                value={resourceSearch}
                onChange={(event) => setResourceSearch(event.target.value)}
                placeholder="Search resources"
              />
              <button
                onClick={loadData}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {resources.map((resource) => {
              const lowStock =
                resource.available_quantity <= resource.minimum_threshold;

              return (
                <article
                  key={resource.id}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-950">{resource.name}</h3>
                      <p className="text-xs font-bold text-slate-400">
                        {titleCase(resource.resource_type)} /{" "}
                        {resource.location || "No location"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                        resource.status
                      )}`}
                    >
                      {titleCase(resource.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white p-3 text-center">
                      <p className="text-xs font-bold text-slate-400">Total</p>
                      <p className="text-xl font-black">{resource.total_quantity}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-center">
                      <p className="text-xs font-bold text-slate-400">Available</p>
                      <p className="text-xl font-black text-emerald-600">
                        {resource.available_quantity}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-center">
                      <p className="text-xs font-bold text-slate-400">Threshold</p>
                      <p className="text-xl font-black">{resource.minimum_threshold}</p>
                    </div>
                  </div>

                  {lowStock && (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2 text-xs font-black text-orange-700">
                      <AlertTriangle size={15} />
                      Low stock alert
                    </p>
                  )}

                  {isAdmin && (
                    <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                      <div className="grid gap-2 sm:grid-cols-[110px_1fr_auto]">
                        <input
                          type="number"
                          className={inputClass}
                          placeholder="+/- qty"
                          value={resourceAction(resource, "adjustment")}
                          onChange={(event) =>
                            setResourceAction(
                              resource.id,
                              "adjustment",
                              event.target.value
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          placeholder="Reason for stock change"
                          value={resourceAction(resource, "reason")}
                          onChange={(event) =>
                            setResourceAction(
                              resource.id,
                              "reason",
                              event.target.value
                            )
                          }
                        />
                        <button
                          onClick={() => adjustStock(resource)}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white"
                        >
                          Adjust
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          placeholder="Allocation quantity"
                          value={resourceAction(resource, "quantity")}
                          onChange={(event) =>
                            setResourceAction(
                              resource.id,
                              "quantity",
                              event.target.value
                            )
                          }
                        />
                        <select
                          className={inputClass}
                          value={resourceAction(resource, "patient_id")}
                          onChange={(event) =>
                            setResourceAction(
                              resource.id,
                              "patient_id",
                              event.target.value
                            )
                          }
                        >
                          <option value="">Allocate to patient</option>
                          {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </option>
                          ))}
                        </select>
                        <select
                          className={inputClass}
                          value={resourceAction(resource, "bed_id")}
                          onChange={(event) =>
                            setResourceAction(
                              resource.id,
                              "bed_id",
                              event.target.value
                            )
                          }
                        >
                          <option value="">Or allocate to bed</option>
                          {beds.map((bed) => (
                            <option key={bed.id} value={bed.id}>
                              {bed.bed_number} ({titleCase(bed.status)})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => allocateResource(resource)}
                          className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-black text-white"
                        >
                          Allocate Resource
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {!loading && resources.length === 0 && (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">
              No resources match the current filters.
            </p>
          )}
        </section>

        {isAdmin && (
          <section className="mt-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList className="text-violet-600" />
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Active Resource Allocations
                </h2>
                <p className="text-sm text-slate-500">
                  Return equipment to inventory when it is no longer in use.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="rounded-3xl border border-violet-100 bg-violet-50 p-5"
                >
                  <p className="font-black text-slate-950">
                    {allocation.resources?.name || "Resource"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Quantity: {allocation.quantity}{" "}
                    {allocation.resources?.unit || "units"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Patient: {allocation.patient?.full_name || "Not specified"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Bed: {allocation.beds?.bed_number || "Not specified"}
                  </p>
                  <button
                    onClick={() =>
                      runAction(
                        `return-${allocation.id}`,
                        () =>
                          bedResourceApi.releaseAllocation(allocation.id),
                        "Resource returned to inventory."
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white"
                  >
                    <Wrench size={15} />
                    Return Resource
                  </button>
                </div>
              ))}
            </div>

            {!loading && allocations.length === 0 && (
              <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-400">
                No active resource allocations.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
