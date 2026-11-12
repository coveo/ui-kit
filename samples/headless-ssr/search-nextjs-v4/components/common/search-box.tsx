interface SearchBoxCommonProps {
  value: string;
  methods?: {updateText(text: string): void; submit(): void};
}

export default function SearchBoxCommon({value, methods}: SearchBoxCommonProps) {
  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        methods?.submit();
      }}
    >
      <input value={value} onChange={(e) => methods?.updateText(e.target.value)} />
    </form>
  );
}
