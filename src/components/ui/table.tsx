interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}

export default function Table({ headers, rows, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((header, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50/50">
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="px-3 py-2.5 text-sm text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
