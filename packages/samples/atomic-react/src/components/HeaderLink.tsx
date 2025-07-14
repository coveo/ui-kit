import type {FunctionComponent} from 'react';

type Props = {
  page: string;
  currentPage: string;
  setPage(page: string): void;
};
export const HeaderLink: FunctionComponent<Props> = ({
  page,
  currentPage,
  setPage,
}: Props) => {
  if (currentPage === page) return null;
  return (
    <li
      onClick={() => {
        setPage(page);
        window.history.pushState({}, '', `?page=${page}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setPage(page);
          window.history.pushState({}, '', `?page=${page}`);
        }
      }}
    >
      {page} example
    </li>
  );
};
