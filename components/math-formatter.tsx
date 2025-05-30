"use client"

import React, { memo } from "react"
import Latex from "react-latex-next"

interface MathFormatterProps {
  text: string
}

export const MathFormatter = memo(function MathFormatter({ text }: MathFormatterProps) {
  // Replace $$ with \$\$ for proper rendering of multiline equations
  const formattedText = text.replace(/\$\$/g, "\\$\\$")

  return (
    <div className="math-content">
      {formattedText.split(/(\$\$?.*?\$\$?)/g).map((part, i) => {
        if (part.startsWith("$$") || part.startsWith("$")) {
          return (
            <React.Fragment key={i}>
              <Latex displayMode={part.startsWith("$$")} inline={part.startsWith("$") && !part.startsWith("$$")}>
                {part}
              </Latex>
            </React.Fragment>
          )
        } else {
          return <React.Fragment key={i}>{part}</React.Fragment>
        }
      })}
    </div>
  )
})
