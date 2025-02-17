"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Try again
        </button>
      </div>
    </div>
  )
}

