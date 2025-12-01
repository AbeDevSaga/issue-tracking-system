// src/components/common/Icons.tsx
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import {
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafety,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCheck,
  AiOutlineMail,
  AiOutlineArrowLeft,
} from "react-icons/ai";

// Centralized icon exports
export {
  AiOutlineLock as LockIcon,
  AiOutlineEye as EyeIcon,
  AiOutlineEyeInvisible as EyeOffIcon,
  AiOutlineSafety as SafetyIcon,
  AiOutlineCheckCircle as CheckCircleIcon,
  AiOutlineCloseCircle as CloseCircleIcon,
  AiOutlineCheck as CheckIcon,
  AiOutlineMail as MailIcon,
  AiOutlineArrowLeft as ArrowLeftIcon,
};

// Icon mapping for dynamic usage
export const Icons = {
  lock: LockIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  safety: SafetyIcon,
  checkCircle: CheckCircleIcon,
  closeCircle: CheckCircleIcon,
  check: CheckIcon,
  mail: MailIcon,
  arrowLeft: ArrowLeftIcon,
};

// Props for dynamic icon component
interface IconProps {
  name: keyof typeof Icons;
  className?: string;
  size?: number;
}

// Dynamic icon component
export const Icon = ({ name, className = "", size = 24 }: IconProps) => {
  const IconComponent = Icons[name];
  return <IconComponent className={className} size={size} />;
};
