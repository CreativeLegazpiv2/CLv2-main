import { Icon } from "@iconify/react/dist/iconify.js";
import { Input, Select, TextArea } from "./Signup";
import { Gender } from "@/services/authservice"
  export const Step2 = ({ formData, handleChange, nextStep, prevStep }: any) => {
    return (
      <div className="w-full h-full flex flex-col gap-4 text-palette-1">
        <h2 className="font-bold text-xl">Step 2.1 Personal Details</h2>

        {/* Birthday Input */}
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          icon="mdi:account-outline"
        />
        <Input
          name="bday"
          value={formData.bday}
          onChange={handleChange}
          type="date"
          placeholder="Birthday"
          icon="mdi:date-range"
        />

        {/* Gender Selection */}
        <Select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={[
            { value: Gender.Male, label: "Male" },
            { value: Gender.Female, label: "Female" },
            { value: Gender.Other, label: "Other" },
          ]}
          icon="mdi:gender-male-female" placeholder={""} />
      </div>
    );
};
