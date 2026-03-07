type SwitchProps = {
  checked: boolean;
  onToggle: () => void;
};

export default function Switch({ checked, onToggle }: SwitchProps) {
  return (
    <button
      className={`inline-flex w-14 rounded-full p-1 transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
      onClick={onToggle}
      type="button"
    >
      <span className={`h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-7" : "translate-x-0"}`} />
    </button>
  );
}
