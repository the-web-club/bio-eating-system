export type DataListRow = {
  label: string;
  value: string;
};

export function DataList({
  caption,
  rows,
}: {
  caption: string;
  rows: DataListRow[];
}) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <tbody className="divide-y divide-hairline">
        {rows.map((row) => (
          <tr key={row.label}>
            <th
              scope="row"
              className="py-3 pr-4 text-body font-normal text-foreground"
            >
              {row.label}
            </th>
            <td className="py-3 text-right font-meta text-small tabular text-foreground">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
