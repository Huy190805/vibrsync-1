export default function WaveBars() {
  return (
    <div className="flex items-end gap-[2px] w-4 h-4">
      <div className="w-[2px] h-full bg-white animate-wave1" />
      <div className="w-[2px] h-3/4 bg-white animate-wave2" />
      <div className="w-[2px] h-2/3 bg-white animate-wave3" />
    </div>
  );
}
