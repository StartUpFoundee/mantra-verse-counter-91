
import React, { useState, useEffect } from "react";
import { getUserData } from "@/utils/spiritualIdUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileDropdown from "./ProfileDropdown";
import ModernCard from "./ModernCard";

const ProfileHeader: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage for immediate UI update
    const localUserData = getUserData();
    if (localUserData) {
      setUserData(localUserData);
    }
  }, []);

  if (!userData) return null;

  return (
    <div className="relative">
      <ProfileDropdown />
    </div>
  );
};

export default ProfileHeader;
