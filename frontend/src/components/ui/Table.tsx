import type { ReactNode } from 'react'

type TableProps = {
  caption: string
  children: ReactNode
}

export function Table({ caption, children }: TableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  )
}
