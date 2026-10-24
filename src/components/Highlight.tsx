/** Wraps the first occurrence of `query` in <mark>; plain text when there is no match. */
export default function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const i = q ? text.toLocaleLowerCase('id').indexOf(q.toLocaleLowerCase('id')) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-accent/20 text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}
