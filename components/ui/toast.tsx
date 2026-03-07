type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  return <div className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">{message}</div>;
}
