import React, { useState } from "react";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { useTranslation } from "react-i18next";

interface Option {
  value: string;
  label: string;
}

interface BranchField {
  id: string;
  label: string;
  type: "text" | "select" | "textarea";
  placeholder?: string;
  options?: Option[];
  value?: any;
}

interface AddBranchProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  organizations: Option[];
  regions: { id: string; name: string }[];
  cities: { id: string; regionId: string; name: string }[];
  subcities: { id: string; cityId: string; name: string }[];
  zones: { id: string; regionId: string; name: string }[];
  woredas: { id: string; zoneId: string | null; subcityId: string | null; name: string }[];
  fields: BranchField[];
}

export default function AddBranch({
  onClose,
  onSubmit,
  organizations,
  regions,
  cities,
  subcities,
  zones,
  woredas,
  fields,
}: AddBranchProps) {
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.value ?? "" }), {}) || {}
  );

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));

    if (id === "location_type") {
      setFormValues((prev) => ({
        ...prev,
        regionId: "",
        zoneId: "",
        cityId: "",
        subcityId: "",
        woredaId: "",
      }));
    }

    if (id === "regionId") {
      setFormValues((prev) => ({ ...prev, zoneId: "", woredaId: "" }));
    }

    if (id === "cityId") {
      setFormValues((prev) => ({ ...prev, subcityId: "", woredaId: "" }));
    }

    if (id === "zoneId" || id === "subcityId") {
      setFormValues((prev) => ({ ...prev, woredaId: "" }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) onSubmit(formValues);
    onClose();
  };

  const filteredCities = cities;
  const filteredSubcities = subcities.filter((sc) => sc.cityId === formValues.cityId);
  const filteredZones = zones.filter((z) => z.regionId === formValues.regionId);
  const filteredWoredas =
    formValues.location_type === "region"
      ? woredas.filter((w) => w.zoneId === formValues.zoneId)
      : woredas.filter((w) => w.subcityId === formValues.subcityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-2">{t("branch.add_branch")}</h2>
        <h6 className="text-sm text-[#094C81] mb-4">{t("branch.modal_title")}</h6>

       <Form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {fields?.map((field) => {
      let options = field.options;

      if (field.id === "cityId")
        options = filteredCities.map((c) => ({ value: c.id, label: c.name }));
      if (field.id === "subcityId")
        options = filteredSubcities.map((sc) => ({ value: sc.id, label: sc.name }));
      if (field.id === "zoneId")
        options = filteredZones.map((z) => ({ value: z.id, label: z.name }));
      if (field.id === "woredaId")
        options = filteredWoredas.map((w) => ({ value: w.id, label: w.name }));

      if (formValues.location_type === "city" && ["regionId", "zoneId"].includes(field.id)) return null;
      if (formValues.location_type === "region" && ["cityId", "subcityId"].includes(field.id)) return null;

      if (field.type === "select") {
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              id={field.id}
              value={formValues[field.id]}
              options={options || []}
              placeholder={field.placeholder}
              onChange={(val: string) => handleChange(field.id, val)}
            />
          </div>
        );
      } else if (field.type === "textarea") {
        return (
          <div key={field.id} className="col-span-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <textarea
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        );
      } else {
        return (
          <div key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              type={field.type}
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </div>
        );
      }
    })}
  </div>

  <div className="mt-4 flex justify-end gap-2">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
    >
      {t("common.cancel")}
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      {t("common.submit")}
    </button>
  </div>
</Form>

      </div>
    </div>
  );
}
