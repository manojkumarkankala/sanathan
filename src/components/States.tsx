import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={40} className="text-primary-500 animate-spin" />
      <p className="mt-4 text-maroon/60 font-heading text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }: { icon: React.ElementType; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-primary-400" />
      </div>
      <h3 className="font-heading font-bold text-xl text-maroon mb-2">{title}</h3>
      <p className="text-maroon/50 max-w-md">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mb-4">
        <span className="text-accent-500 text-3xl">!</span>
      </div>
      <h3 className="font-heading font-bold text-xl text-maroon mb-2">Something went wrong</h3>
      <p className="text-maroon/50 max-w-md">{message}</p>
    </div>
  );
}
