
import React from "react";
import AlarmSystem from "./AlarmSystem";

interface CompletionAlertProps {
  isOpen: boolean;
  targetCount: number;
  onClose: () => void;
}

const CompletionAlert: React.FC<CompletionAlertProps> = ({ isOpen, targetCount, onClose }) => {
  return (
    <AlarmSystem
      isActive={isOpen}
      onStop={onClose}
      targetCount={targetCount}
      completedCount={targetCount}
    />
  );
};

export default CompletionAlert;
