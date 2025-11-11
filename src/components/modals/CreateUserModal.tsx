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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User Type first */}
          <div>
            <Label>User Type</Label>
            <Select
              value={selectedUserTypeId}
              onValueChange={setSelectedUserTypeId}
              disabled={loadingUserTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select User Type" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((type: UserType) => (
                  <SelectItem key={type.user_type_id} value={type.user_type_id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Full Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+251 9xxxxxxx"
            />
          </div>

          {/* Position */}
          <div>
            <Label>Position</Label>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Backend Developer"
            />
          </div>

          {/* Institute only for external users */}
          {selectedUserType?.name === "external_user" && (
            <div>
              <Label>Institute</Label>
              <Select
                value={instituteId}
                onValueChange={setInstituteId}
                disabled={loadingInstitutes}
              >
                <SelectTrigger>
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
          <div>
            <Label>Status</Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(val) => setIsActive(val === "active")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
