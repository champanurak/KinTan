import { Heart } from "lucide-react";

interface LikeButtonProps {
  liked: boolean;
  onClick: () => void;
}

export function LikeButton({ liked, onClick }: LikeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
        liked
          ? "border-red-700/60 bg-red-900/40 text-red-400"
          : "border-slate-600 bg-slate-700 text-slate-400 hover:bg-slate-600"
      }`}
    >
      <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
