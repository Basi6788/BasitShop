import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };

export default function AnimatedButton({ label, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`transition transform hover:-translate-y-1 active:scale-95 motion-reduce:transform-none px-4 py-2 rounded-2xl shadow-md ring-1 ring-slate-200 \${className}`}
    >
      {label || children}
    </button>
  );
}
