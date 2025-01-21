import { parseString } from "https://unpkg.com/xml2js@0.4.23/lib/xml2js.js"

document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone")
  const fileInput = document.getElementById("file-input")
  const importOptions = document.getElementById("import-options")
  const startImportBtn = document.getElementById("start-import")
  const importProgress = document.getElementById("import-progress")
  const progressBar = document.querySelector(".progress-bar")
  const progressText = document.getElementById("progress-text")
  const importResults = document.getElementById("import-results")
  const resultsContainer = document.getElementById("results-container")
  const downloadJsonBtn = document.getElementById("download-json")
  const analyzerForm = document.getElementById("analyzer-form")
  const analyzerResults = document.getElementById("analyzer-results")
  const analysisContainer = document.getElementById("analysis-container")
  const generateXmlBtn = document.getElementById("generate-xml")
  const detectorForm = document.getElementById("detector-form")
  const detectorResults = document.getElementById("detector-results")
  const themeInfo = document.getElementById("theme-info")
  const pluginList = document.getElementById("plugin-list")
  const seoForm = document.getElementById("seo-form")
  const seoResults = document.getElementById("seo-results")
  const seoScore = document.getElementById("seo-score")
  const seoRecommendations = document.getElementById("seo-recommendations")
  const performanceForm = document.getElementById("performance-form")
  const performanceResults = document.getElementById("performance-results")
  const performanceScore = document.getElementById("performance-score")
  const performanceChart = document.getElementById("performance-chart")
  const securityForm = document.getElementById("security-form")
  const securityResults = document.getElementById("security-results")
  const securityScore = document.getElementById("security-score")
  const securityIssues = document.getElementById("security-issues")

  let wxrContent = null
  let analyzedData = null

  // WXR Importer functionality
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false)
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false)
  })

  function highlight() {
    dropZone.classList.add("bg-indigo-100", "dark:bg-indigo-900")
  }

  function unhighlight() {
    dropZone.classList.remove("bg-indigo-100", "dark:bg-indigo-900")
  }

  dropZone.addEventListener("drop", handleDrop, false)

  function handleDrop(e) {
    const dt = e.dataTransfer
    const file = dt.files[0]
    handleFile(file)
  }

  fileInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0])
  })

  function handleFile(file) {
    if (file.type !== "text/xml") {
      showNotification("Please upload a valid WXR file (.xml)", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      wxrContent = e.target.result
      importOptions.classList.remove("hidden")
      importOptions.classList.add("fade-in")
    }
    reader.readAsText(file)
  }

  startImportBtn.addEventListener("click", startImport)

  async function startImport() {
    if (!wxrContent) {
      showNotification("Please upload a WXR file first", "error")
      return
    }

    importProgress.classList.remove("hidden")
    importResults.classList.add("hidden")

    try {
      const result = await new Promise((resolve, reject) => {
        parseString(wxrContent, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      const importData = await processWXRData(result)
      displayResults(importData)
    } catch (error) {
      console.error("Error parsing WXR file:", error)
      showNotification("Error parsing WXR file. Please try again.", "error")
    }
  }

  async function processWXRData(data) {
    const importData = {
      posts: [],
      pages: [],
      comments: [],
      categories: [],
      tags: [],
      media: [],
    }

    const channel = data.rss.channel[0]
    const totalItems = channel.item ? channel.item.length : 0
    let processedItems = 0

    if (channel.item) {
      for (const item of channel.item) {
        const postType = item["wp:post_type"][0]
        if (
          (postType === "post" && document.getElementById("import-posts").checked) ||
          (postType === "page" && document.getElementById("import-pages").checked)
        ) {
          const post = {
            title: item.title[0],
            link: item.link[0],
            pubDate: item.pubDate[0],
            creator: item["dc:creator"][0],
            content: item["content:encoded"][0],
          }
          if (postType === "post") {
            importData.posts.push(post)
          } else {
            importData.pages.push(post)
          }
        }

        if (document.getElementById("import-comments").checked && item["wp:comment"]) {
          for (const comment of item["wp:comment"]) {
            const commentData = {
              author: comment["wp:comment_author"][0],
              authorEmail: comment["wp:comment_author_email"][0],
              authorUrl: comment["wp:comment_author_url"][0],
              date: comment["wp:comment_date"][0],
              content: comment["wp:comment_content"][0],
            }
            importData.comments.push(commentData)
          }
        }

        if (document.getElementById("import-media").checked && postType === "attachment") {
          const media = {
            title: item.title[0],
            url: item["wp:attachment_url"][0],
            type: item["wp:post_mime_type"][0],
          }
          importData.media.push(media)
        }

        updateProgress(++processedItems, totalItems)
        await new Promise((resolve) => setTimeout(resolve, 0)) // Allow UI to update
      }
    }

    if (document.getElementById("import-categories").checked && channel["wp:category"]) {
      for (const category of channel["wp:category"]) {
        const categoryData = {
          name: category["wp:cat_name"][0],
          slug: category["wp:category_nicename"][0],
        }
        importData.categories.push(categoryData)
      }
    }

    if (document.getElementById("import-tags").checked && channel["wp:tag"]) {
      for (const tag of channel["wp:tag"]) {
        const tagData = {
          name: tag["wp:tag_name"][0],
          slug: tag["wp:tag_slug"][0],
        }
        importData.tags.push(tagData)
      }
    }

    return importData
  }

  function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100)
    progressBar.style.width = `${percentage}%`
    progressBar.setAttribute("aria-valuenow", percentage)
    progressText.textContent = `${percentage}% Complete`
  }

  function displayResults(data) {
    importProgress.classList.add("hidden")
    importResults.classList.remove("hidden")
    importResults.classList.add("fade-in")

    resultsContainer.innerHTML = `
            <p class="mb-2"><span class="font-semibold">Posts imported:</span> ${data.posts.length}</p>
            <p class="mb-2"><span class="font-semibold">Pages imported:</span> ${data.pages.length}</p>
            <p class="mb-2"><span class="font-semibold">Comments imported:</span> ${data.comments.length}</p>
            <p class="mb-2"><span class="font-semibold">Categories imported:</span> ${data.categories.length}</p>
            <p class="mb-2"><span class="font-semibold">Tags imported:</span> ${data.tags.length}</p>
            <p class="mb-2"><span class="font-semibold">Media items imported:</span> ${data.media.length}</p>
        `

    downloadJsonBtn.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "wordpress_import.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
    })

    showNotification("Import completed successfully!", "success")
  }

  // Website Analyzer functionality
  analyzerForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const url = document.getElementById("website-url").value
    analyzedData = await analyzeWebsite(url)
    displayAnalysisResults(analyzedData)
  })

  async function analyzeWebsite(url) {
    showNotification("Analyzing website...", "info")
    try {
      const response = await fetch(`https://api.example.com/analyze?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error("Failed to analyze website")
      }
      const data = await response.json()
      showNotification("Website analysis complete!", "success")
      return data
    } catch (error) {
      console.error("Error analyzing website:", error)
      showNotification("Error analyzing website. Please try again.", "error")
    }
  }

  function displayAnalysisResults(data) {
    analyzerResults.classList.remove("hidden")
    analyzerResults.classList.add("fade-in")

    analysisContainer.innerHTML = `
            <p class="mb-2"><span class="font-semibold">Total Posts:</span> ${data.totalPosts}</p>
            <p class="mb-2"><span class="font-semibold">Total Pages:</span> ${data.totalPages}</p>
            <p class="mb-2"><span class="font-semibold">Total Comments:</span> ${data.totalComments}</p>
            <p class="mb-2"><span class="font-semibold">Categories:</span> ${data.categories.join(", ")}</p>
            <p class="mb-2"><span class="font-semibold">Tags:</span> ${data.tags.join(", ")}</p>
        `

    const ctx = document.getElementById("analysis-chart").getContext("2d")
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Posts", "Pages", "Comments"],
        datasets: [
          {
            data: [data.totalPosts, data.totalPages, data.totalComments],
            backgroundColor: ["#4f46e5", "#10b981", "#f59e0b"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Website Content Distribution",
          },
        },
      },
    })

    generateXmlBtn.addEventListener("click", () => generateXML(data))
  }

  function generateXML(data) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
    ${data.posts
      .map(
        (post) => `
    <item>
        <title>${escapeXml(post.title)}</title>
        <link>${escapeXml(post.link)}</link>
        <pubDate>${post.pubDate}</pubDate>
        <dc:creator>${escapeXml(post.author)}</dc:creator>
        <content:encoded><![CDATA[${post.content}]]></content:encoded>
    </item>
    `,
      )
      .join("")}
</channel>
</rss>`

    const blob = new Blob([xml], { type: "text/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "wordpress_export.xml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;"
        case ">":
          return "&gt;"
        case "&":
          return "&amp;"
        case "'":
          return "&apos;"
        case '"':
          return "&quot;"
      }
    })
  }

  // Theme & Plugin Detector functionality
  detectorForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const url = document.getElementById("detector-url").value
    const detectionData = await detectThemeAndPlugins(url)
    displayDetectionResults(detectionData)
  })

  async function detectThemeAndPlugins(url) {
    showNotification("Detecting theme and plugins...", "info")
    try {
      const response = await fetch(`https://api.example.com/detect?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error("Failed to detect theme and plugins")
      }
      const data = await response.json()
      showNotification("Theme and plugin detection complete!", "success")
      return data
    } catch (error) {
      console.error("Error detecting theme and plugins:", error)
      showNotification("Error detecting theme and plugins. Please try again.", "error")
    }
  }

  function displayDetectionResults(data) {
    detectorResults.classList.remove("hidden")
    detectorResults.classList.add("fade-in")

    themeInfo.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Detected Theme</h4>
            <p class="mb-1"><span class="font-semibold">Name:</span> ${data.theme.name}</p>
            <p class="mb-1"><span class="font-semibold">Version:</span> ${data.theme.version}</p>
            <p class="mb-1"><span class="font-semibold">Author:</span> ${data.theme.author}</p>
        `

    pluginList.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Detected Plugins</h4>
            <ul class="list-disc pl-5">
                ${data.plugins
                  .map(
                    (plugin) => `
                    <li class="mb-2">
                        <span class="font-semibold">${plugin.name}</span> (v${plugin.version}) by ${plugin.author}
                    </li>
                `,
                  )
                  .join("")}
            </ul>
        `
  }

  // SEO Optimizer functionality
  seoForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const url = document.getElementById("seo-url").value
    const seoData = await analyzeSEO(url)
    displaySEOResults(seoData)
  })

  async function analyzeSEO(url) {
    showNotification("Analyzing SEO...", "info")
    try {
      const response = await fetch(`https://api.example.com/seo?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error("Failed to analyze SEO")
      }
      const data = await response.json()
      showNotification("SEO analysis complete!", "success")
      return data
    } catch (error) {
      console.error("Error analyzing SEO:", error)
      showNotification("Error analyzing SEO. Please try again.", "error")
    }
  }

  function displaySEOResults(data) {
    seoResults.classList.remove("hidden")
    seoResults.classList.add("fade-in")

    seoScore.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">SEO Score: ${data.score}/100</h4>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${data.score}%"></div>
            </div>
        `

    seoRecommendations.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">SEO Recommendations</h4>
            <ul class="list-disc pl-5">
                ${data.recommendations
                  .map(
                    (rec) => `
                    <li class="mb-2">
                        <span class="${rec.status === "good" ? "text-green-600" : "text-yellow-600"}">
                            ${rec.status === "good" ? "✓" : "⚠"}
                        </span>
                        ${rec.message}
                    </li>
                `,
                  )
                  .join("")}
            </ul>
        `
  }

  // Performance Analyzer functionality
  performanceForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const url = document.getElementById("performance-url").value
    const performanceData = await analyzePerformance(url)
    displayPerformanceResults(performanceData)
  })

  async function analyzePerformance(url) {
    showNotification("Analyzing performance...", "info")
    try {
      const response = await fetch(`https://api.example.com/performance?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error("Failed to analyze performance")
      }
      const data = await response.json()
      showNotification("Performance analysis complete!", "success")
      return data
    } catch (error) {
      console.error("Error analyzing performance:", error)
      showNotification("Error analyzing performance. Please try again.", "error")
    }
  }

  function displayPerformanceResults(data) {
    performanceResults.classList.remove("hidden")
    performanceResults.classList.add("fade-in")

    performanceScore.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Performance Score: ${data.score}/100</h4>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div class="bg-green-600 h-2.5 rounded-full" style="width: ${data.score}%"></div>
            </div>
        `

    const ctx = performanceChart.getContext("2d")
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "First Contentful Paint",
          "Speed Index",
          "Largest Contentful Paint",
          "Time to Interactive",
          "Total Blocking Time",
          "Cumulative Layout Shift",
        ],
        datasets: [
          {
            label: "Performance Metrics",
            data: [data.fcp, data.si, data.lcp, data.tti, data.tbt, data.cls],
            backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Performance Metrics",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Security Scanner functionality
  securityForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const url = document.getElementById("security-url").value
    const securityData = await scanSecurity(url)
    displaySecurityResults(securityData)
  })

  async function scanSecurity(url) {
    showNotification("Scanning security...", "info")
    try {
      const response = await fetch(`https://api.example.com/security?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error("Failed to scan security")
      }
      const data = await response.json()
      showNotification("Security scan complete!", "success")
      return data
    } catch (error) {
      console.error("Error scanning security:", error)
      showNotification("Error scanning security. Please try again.", "error")
    }
  }

  function displaySecurityResults(data) {
    securityResults.classList.remove("hidden")
    securityResults.classList.add("fade-in")

    securityScore.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Security Score: ${data.score}/100</h4>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div class="bg-green-600 h-2.5 rounded-full" style="width: ${data.score}%"></div>
            </div>
        `

    securityIssues.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Security Issues</h4>
            <ul class="list-disc pl-5">
                ${data.issues
                  .map(
                    (issue) => `
                    <li class="mb-2">
                        <span class="${issue.severity === "high" ? "text-red-600" : issue.severity === "medium" ? "text-yellow-600" : "text-blue-600"}">
                            [${issue.severity.toUpperCase()}]
                        </span>
                        ${issue.message}
                    </li>
                `,
                  )
                  .join("")}
            </ul>
        `
  }

  function showNotification(message, type) {
    Swal.fire({
            title: message,
            icon: type,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseHere's the continuation of the text stream from the cut-off point:

true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
  }

  // Dark mode toggle
  const darkModeToggle = document.querySelector("[x-data]")
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark")
  })

  // Automatic dark mode based on user's system preferences
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark")
  }

  // Lazy loading for images
  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute("data-src")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      })
    })
  })
})

