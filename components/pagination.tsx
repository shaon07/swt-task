"use client"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1)
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Adjust range if at the beginning or end
    if (currentPage <= 3) {
      rangeEnd = Math.min(4, totalPages - 1)
    } else if (currentPage >= totalPages - 2) {
      rangeStart = Math.max(totalPages - 3, 2)
    }

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      pages.push("...")
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...")
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-1">
        <button
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              className={`px-3 py-1 rounded-md ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2">
              {page}
            </span>
          ),
        )}

        <button
          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}
