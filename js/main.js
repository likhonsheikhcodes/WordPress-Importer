import { parseString } from "https://unpkg.com/xml2js@0.4.23/lib/xml2js.js"

document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone")
  const fileInput = document.getElementById("file-input")
  const importOptions = document.getElementById("import-options")
  const startImportBtn = document.getElementById("start-import")
  const importProgress = document.getElementById("import-progress")
  const progressBar = document.querySelector(".progress")
  const progressText = document.getElementById("progress-text")
  const importResults = document.getElementById("import-results")
  const resultsContainer = document.getElementById("results-container")
  const downloadJsonBtn = document.getElementById("download-json")

  let wxrContent = null

  // Drag and drop functionality
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
    dropZone.classList.add("highlight")
  }

  function unhighlight() {
    dropZone.classList.remove("highlight")
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
    progressText.textContent = `${percentage}% Complete`
  }

  function displayResults(data) {
    importProgress.classList.add("hidden")
    importResults.classList.remove("hidden")
    importResults.classList.add("fade-in")

    resultsContainer.innerHTML = `
            <p><i class="fas fa-file-alt"></i> Posts imported: ${data.posts.length}</p>
            <p><i class="fas fa-file"></i> Pages imported: ${data.pages.length}</p>
            <p><i class="fas fa-comments"></i> Comments imported: ${data.comments.length}</p>
            <p><i class="fas fa-tags"></i> Categories imported: ${data.categories.length}</p>
            <p><i class="fas fa-tag"></i> Tags imported: ${data.tags.length}</p>
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

  function showNotification(message, type) {
    const notification = document.createElement("div")
    notification.textContent = message
    notification.className = `notification ${type}`
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
      setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 3000)
    }, 100)
  }
})

