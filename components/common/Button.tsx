
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, icon, isLoading = false, ...props }) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-white transition-all duration-300 ease-in-out bg-cyan-600 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-lg group-hover:blur-xl"></span>
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  );
};
