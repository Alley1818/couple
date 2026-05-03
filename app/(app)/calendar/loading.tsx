export default function Loading() {
  return (
    <div className="px-4 pt-6 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-28 bg-stone-200 rounded-lg mb-6" />
      <div className="h-8 w-48 bg-stone-100 rounded mx-auto mb-4" />
      <div className="grid grid-cols-7 gap-1">
        {Array(35).fill(0).map((_,i) => <div key={i} className="aspect-square bg-stone-100 rounded-lg" />)}
      </div>
    </div>
  )
}
