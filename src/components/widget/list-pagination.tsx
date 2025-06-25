import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Link } from '@/i18n/navigation';

interface ListPaginationProps {
  currentPage: number;
  totalPages: number;
  category: string;
  listName: string;
}

function getPaginationNumbers(current: number, total: number) {
  const pages: (number | 'ellipsis')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (current > 4) pages.push('ellipsis');
  for (
    let i = Math.max(2, current - 2);
    i <= Math.min(total - 1, current + 2);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 3) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export default function ListPagination({
  listName,
  currentPage,
  totalPages,
  category,
}: ListPaginationProps) {
  const pageNumbers = getPaginationNumbers(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious
              href={`/${listName}/${category}?page=${currentPage - 1}`}
            />
          ) : (
            <PaginationPrevious href="#" aria-disabled />
          )}
        </PaginationItem>
        {pageNumbers.map((num, idx) =>
          num === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={num}>
              <PaginationLink
                href={`/${listName}/${category}?page=${num}`}
                isActive={num === currentPage}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext
              href={`/${listName}/${category}?page=${currentPage + 1}`}
            />
          ) : (
            <PaginationNext href="#" aria-disabled />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
