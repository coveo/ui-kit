import type {SearchBox as SearchBoxController} from '@coveo/headless/ssr';

interface SearchBoxCommonProps {
  controller: Omit<SearchBoxController, 'state' | 'subscribe'> | undefined;
  value: string;
}

export default function SearchBoxCommon({
  controller,
  value,
}: SearchBoxCommonProps) {
  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        controller?.submit();
      }}
    >
      <input
        value={value}
        onChange={(e) => controller?.updateText(e.target.value)}
      />
    </form>
  );
}
