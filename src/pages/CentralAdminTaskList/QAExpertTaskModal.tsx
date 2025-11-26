import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useTranslation } from "react-i18next";

interface AssignQAExpertProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type:
    | "text"
    | "email"
    | "password"
    | "toggle"
    | "select"
    | "textarea"
    | "number"
    | "date"
    | "file";
    placeholder?: string;
    options?: { value: string; label: string }[];
    value?: any;
  }>;
}

export default function AssignQAExpert({
  onClose,
  onSubmit,
  fields,
}: AssignQAExpertProps) {
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, any> = {};

    fields?.forEach((field) => {
      if (field.type === "toggle") {
        values[field.id] = (
          event.currentTarget.elements.namedItem(field.id) as HTMLInputElement
        )?.checked;
      } else {
        values[field.id] = formData.get(field.id);
      }
    });

    onSubmit?.(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl text-[#094C81] font-semibold mb-4">
          {t("Assign Task to Developer")}
        </h2>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            Assigning task for:
          </p>
          <p className="font-semibold text-[#094C81]">
            EAll-0032 - Login timeout on mobile application
          </p>
          <p className="text-gray-500 text-sm">Category: Mobile App</p>
        </div>

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fields
              ?.filter((field) => field.type !== "file")
              .map((field) => (
                <div key={field.id}>
                  {field.type === "toggle" ? (
                    <Switch
                      label={field.label}
                      id={field.id}
                      defaultChecked={field.value ?? false}
                    />
                  ) : field.type === "select" ? (
                    <>
                      <Label className="text-[#094C81]" htmlFor={field.id}>
                        {field.label}
                      </Label>
                      <Select
                        id={field.id}
                        options={field.options || []}
                        placeholder={field.placeholder}
                        defaultValue={field.value ?? ""}
                      />
                    </>
                  ) : field.type === "textarea" ? (
                    <>
                      <Label className="text-[#094C81]" htmlFor={field.id}>
                        {field.label}
                      </Label>
                      <textarea
                        id={field.id}
                        name={field.id}
                        placeholder={field.placeholder}
                        defaultValue={field.value ?? ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E516A] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </>
                  ) : (
                    <>
                      <Label className="text-[#094C81]" htmlFor={field.id}>
                        {field.label}
                      </Label>
                      <Input
                        type={field.type}
                        id={field.id}
                        name={field.id}
                        placeholder={field.placeholder}
                        defaultValue={field.value ?? ""}
                      />
                    </>
                  )}
                </div>
              ))}
          </div>

          {/* {fields?.some((field) => field.type === "file") && (
            <div>
              {fields
                .filter((field) => field.type === "file")
                .map((field) => (
                  <div key={field.id}>
                    <Label className="text-[#094C81]" htmlFor={field.id}>
                      {field.label}
                    </Label>
                    <div className="border-2 w-full border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 cursor-pointer hover:border-[#1E516A] transition">
                      <p>
                        Drag your file(s) or{" "}
                        <span className="text-[#1E516A] underline">browse</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Max xx MB files are allowed
                      </p>
                      <input
                        id={field.id}
                        name={field.id}
                        type="file"
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}
            </div>
          )} */}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold hover:bg-[#18465C] transition"
            >
              Assign Task
            </button>
          </div>
        </Form>

      </div>
    </div>
  );
}
