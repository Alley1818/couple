export default function Loading() {
  return (
    <div className="px-4 pt-6 max-w-lg mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-28 bg-stone-200 rounded-lg" />
        <div className="h-9 w-24 bg-stone-200 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-xl" />)}
      </div>
    </div>
  )
}
