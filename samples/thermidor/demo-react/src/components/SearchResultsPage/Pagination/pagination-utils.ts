export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function computeVisiblePages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({length: totalPages}, (_, i) => i);
  }

  if (currentPage <= 1) {
    return [0, 1, 2, 'ellipsis-end', totalPages - 1];
  }

  if (currentPage >= totalPages - 2) {
    return [0, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1];
  }

  return [0, 'ellipsis-start', currentPage, 'ellipsis-end', totalPages - 1];
}
