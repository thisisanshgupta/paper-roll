import { NextResponse } from "next/server"
import type { Paper } from "@/types/paper"
import { XMLParser } from "fast-xml-parser"

// Cache the response for 1 hour
export const revalidate = 3600

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "20")

    // Calculate start index for pagination
    const start = (page - 1) * pageSize

    console.log(`Fetching papers: page=${page}, pageSize=${pageSize}, start=${start}`)

    // Use a more general query to ensure we get results
    // Using 'all' as search_query will return papers from all categories
    const apiUrl = `https://export.arxiv.org/api/query?search_query=all&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${pageSize}`

    console.log(`arXiv API URL: ${apiUrl}`)

    // Fetch papers from arXiv API
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Paper-Roll/1.0 (Research Paper Browser App)",
      },
    })

    if (!response.ok) {
      console.error(`arXiv API error: ${response.status} ${response.statusText}`)
      throw new Error(`arXiv API responded with status: ${response.status}`)
    }

    const xmlData = await response.text()

    // Log a sample of the response to help with debugging
    console.log(`arXiv API response sample: ${xmlData.substring(0, 200)}...`)

    // Parse XML response using fast-xml-parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => ["entry", "author", "category", "link"].includes(name),
    })

    const result = parser.parse(xmlData)

    // Log the parsed result structure to help with debugging
    console.log(
      "Parsed feed structure:",
      result.feed ? `Found feed with ${result.feed.entry ? result.feed.entry.length : 0} entries` : "No feed found",
    )

    // Check if we have entries
    if (!result.feed || !result.feed.entry || result.feed.entry.length === 0) {
      console.log("No entries found in arXiv response")
      return NextResponse.json([])
    }

    // Map entries to Paper objects
    const papers: Paper[] = result.feed.entry.map((entry: any, index: number) => {
      try {
        // Extract authors - handle both single author and multiple authors
        let authors = []
        if (Array.isArray(entry.author)) {
          authors = entry.author.map((author: any) => author.name || "Unknown Author")
        } else if (entry.author && entry.author.name) {
          authors = [entry.author.name]
        } else {
          authors = ["Unknown Author"]
        }

        // Extract categories - handle both single category and multiple categories
        let categories = []
        if (Array.isArray(entry.category)) {
          categories = entry.category.map((cat: any) => {
            const fullCategory = cat["@_term"] || ""
            // Get the part after the last dot, or the whole string if no dot
            return fullCategory.split(".").pop() || fullCategory
          })
        } else if (entry.category && entry.category["@_term"]) {
          const fullCategory = entry.category["@_term"]
          categories = [fullCategory.split(".").pop() || fullCategory]
        } else {
          categories = ["Uncategorized"]
        }

        // Extract ID (last part after the last slash)
        const idParts = entry.id.split("/")
        const id = idParts[idParts.length - 1]

        // Find PDF link
        let pdfLink = ""
        if (Array.isArray(entry.link)) {
          const pdfLinkObj = entry.link.find((link: any) => link["@_title"] === "pdf")
          pdfLink = pdfLinkObj ? pdfLinkObj["@_href"] : ""
        }

        // Create arxiv URL
        const arxivUrl = `https://arxiv.org/abs/${id}`

        return {
          id,
          title: entry.title ? entry.title.trim() : `Paper ${index + 1}`,
          summary: entry.summary ? entry.summary.trim() : "No summary available",
          published: entry.published || new Date().toISOString(),
          updated: entry.updated || entry.published || new Date().toISOString(),
          authors,
          categories,
          link: pdfLink || arxivUrl,
          arxivUrl,
        }
      } catch (error) {
        console.error(`Error parsing paper at index ${index}:`, error)
        // Return a fallback paper object if parsing fails
        return {
          id: `fallback-${index}`,
          title: `Paper ${index + 1}`,
          summary: "Error parsing paper data",
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          authors: ["Unknown Author"],
          categories: ["Uncategorized"],
          link: "https://arxiv.org",
          arxivUrl: "https://arxiv.org",
        }
      }
    })

    console.log(`Successfully parsed ${papers.length} papers`)
    return NextResponse.json(papers)
  } catch (error) {
    console.error("Error fetching papers:", error)
    return NextResponse.json(
      { error: "Failed to fetch papers from arXiv", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
