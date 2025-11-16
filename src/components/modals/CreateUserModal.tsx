"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/cn/dialog";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";

import {
  useCreateUserMutation,
  useGetUserTypesQuery,
  UserType,
  CreateUserDto,
} from "../../redux/services/userApi";

import {
  useGetInstitutesQuery,
  Institute,
} from "../../redux/services/instituteApi";


interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedUserTypeId, setSelectedUserTypeId] = useState<string>("");
  const [instituteId, setInstituteId] = useState<string>("");


  // Fetch user types
  const { data: userTypesResponse, isLoading: loadingUserTypes } =
    useGetUserTypesQuery();
  const userTypes: UserType[] = userTypesResponse?.data || [];

  // Get the selected user type object
  const selectedUserType = userTypes.find(
    (ut) => ut.user_type_id === selectedUserTypeId
  );

  // Fetch institutes
  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();

  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleSubmit = async () => {
    if (!fullName || !email || !selectedUserTypeId) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedUserType?.name === "external_user" && !instituteId) {
      toast.error("Please select an institute for external users");
      return;
    }

    const payload: CreateUserDto = {
      full_name: fullName,
      email,
      phone_number: phoneNumber || undefined,
      user_type_id: selectedUserTypeId,
      position: position || undefined,
      ...(selectedUserType?.name === "external_user" && {
        institute_id: instituteId,
      }),
    };

    try {
      await createUser(payload).unwrap();
      toast.success("User created successfully!");
      onClose();

      // Reset form
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPosition("");
      setSelectedUserTypeId("");
      setIsActive(true);
      setInstituteId("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setPosition("");
    setSelectedUserTypeId("");
    setIsActive(true);
    setInstituteId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create User
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Left Column */}
            <div className="space-y-4">
              {/* User Type first */}
              <div className="space-y-2">
                <Label htmlFor="user-type" className="font-medium">
                  User Type *
                </Label>
                <Select
                  value={selectedUserTypeId}
                  onValueChange={(value) => {
                    setSelectedUserTypeId(value);
                  }}
                  disabled={loadingUserTypes}
                >
                  <SelectTrigger id="user-type" className="w-full">
                    <SelectValue placeholder="Select User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type: UserType) => (
                      <SelectItem
                        key={type.user_type_id}
                        value={type.user_type_id}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name" className="font-medium">
                  Full Name *
                </Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251 9xxxxxxx"
                  className="w-full"
                />
              </div>

              {/* Institute only for external users */}
              {selectedUserType?.name === "external_user" && (
                <div className="space-y-2">
                  <Label htmlFor="institute" className="font-medium">
                    Institute *
                  </Label>
                  <Select
                    value={instituteId}
                    onValueChange={setInstituteId}
                    disabled={loadingInstitutes}
                  >
                    <SelectTrigger id="institute" className="w-full">
                      <SelectValue placeholder="Select Institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutes?.map((inst: Institute) => (
                        <SelectItem
                          key={inst.institute_id}
                          value={inst.institute_id}
                        >
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="font-medium">
                  Status
                </Label>
                <Select
                  value={isActive ? "active" : "inactive"}
                  onValueChange={(val) => setIsActive(val === "active")}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2 border-t pt-4">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
