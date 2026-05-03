export default function Loading() {
  return (
    <div className="px-4 pt-6 max-w-lg mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-40 bg-stone-200 rounded-lg mb-2" />
          <div className="h-4 w-24 bg-stone-100 rounded" />
        </div>
        <div className="w-10 h-10 bg-stone-200 rounded-full" />
      </div>
      <div className="h-36 bg-stone-200 rounded-2xl mb-5" />
      <div className="h-4 w-32 bg-stone-100 rounded mb-3" />
      <div className="space-y-2">
        {[1,2].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl" />)}
      </div>
    </div>
  )
}
