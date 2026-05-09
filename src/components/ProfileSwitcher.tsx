import { motion } from "motion/react";
import { User, Baby, Users } from "lucide-react";
import { Profile } from "../types";

interface ProfileSwitcherProps {
  profiles: Profile[];
  currentProfileId: string;
  onSwitch: (id: string) => void;
}

const getIcon = (id: string) => {
  switch (id) {
    case 'child': return <Baby size={20} />;
    case 'guest': return <Users size={20} />;
    default: return <User size={20} />;
  }
};

export function ProfileSwitcher({ profiles, currentProfileId, onSwitch }: ProfileSwitcherProps) {
  return (
    <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit" role="tablist" aria-label="Switch scanning profile">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          role="tab"
          aria-selected={currentProfileId === profile.id}
          onClick={() => onSwitch(profile.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
            ${currentProfileId === profile.id 
              ? "bg-white text-navy shadow-lg" 
              : "text-slate-400 hover:text-white"
            }
          `}
        >
          {getIcon(profile.id)}
          {profile.name}
        </button>
      ))}
    </div>
  );
}
