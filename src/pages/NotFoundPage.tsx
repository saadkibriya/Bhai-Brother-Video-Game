import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-[#07080D]">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#151826] border border-[#23273A] text-[#4F7CFF]">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-lg font-bold text-slate-200">Session Not Found</h2>
        <p className="text-xs text-slate-400">
          The page or game you are looking for has moved or does not exist.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Lounge Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
