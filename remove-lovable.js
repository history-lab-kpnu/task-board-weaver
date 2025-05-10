import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.dirname(__filename)

// 1. Modify vite.config.ts
function updateViteConfig() {
  const viteConfigPath = path.join(projectRoot, "vite.config.ts")

  if (fs.existsSync(viteConfigPath)) {
    let content = fs.readFileSync(viteConfigPath, "utf8")

    // Remove the import line
    content = content.replace(
      /import\s*{\s*componentTagger\s*}\s*from\s*["']lovable-tagger["'];?\s*/g,
      ""
    )

    // Replace the specified lines
    content = content.replace(
      /mode\s*===\s*['"]development['"] &&\s*componentTagger\(\),/g,
      ""
    )

    fs.writeFileSync(viteConfigPath, content)
    console.log("✅ Updated vite.config.ts")
  } else {
    console.log("❌ vite.config.ts not found")
  }
}

// 2. Delete README.md
function deleteReadme() {
  const readmePath = path.join(projectRoot, "README.md")

  if (fs.existsSync(readmePath)) {
    fs.unlinkSync(readmePath)
    console.log("✅ Deleted README.md")
  } else {
    console.log("❌ README.md not found")
  }
}

// 3. Remove "lovable-tagger" package from package.json and add script
function removePackage() {
  try {
    // Check if package.json exists first
    const packageJsonPath = path.join(projectRoot, "package.json")
    if (fs.existsSync(packageJsonPath)) {
      console.log("Updating package.json...")

      // Read package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

      // Remove lovable-tagger from dependencies and devDependencies
      if (
        packageJson.dependencies &&
        packageJson.dependencies["lovable-tagger"]
      ) {
        delete packageJson.dependencies["lovable-tagger"]
      }

      if (
        packageJson.devDependencies &&
        packageJson.devDependencies["lovable-tagger"]
      ) {
        delete packageJson.devDependencies["lovable-tagger"]
      }

      // Add script command to run create-gitlab-repo.js
      if (!packageJson.scripts) {
        packageJson.scripts = {}
      }
      packageJson.scripts["create-gitlab"] = "node create-gitlab-repo.js"
      console.log("✅ Added create-gitlab script to package.json")

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log("✅ Updated package.json")
    } else {
      console.log("❌ package.json not found")
    }
  } catch (error) {
    console.error("❌ Failed to update package.json:", error.message)
  }
}

// 4. Update index.html and add contact button
function updateIndexHtml() {
  const indexPath = path.join(projectRoot, "index.html")

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, "utf8")

    // Remove script tag and comment
    content = content.replace(
      /\s*<!-- IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! -->\s*/g,
      ""
    )
    content = content.replace(
      /\s*<script src="https:\/\/cdn\.gpteng\.co\/gptengineer\.js" type="module"><\/script>\s*/g,
      ""
    )

    // Remove twitter:image, og:image, and twitter:site meta tags
    content = content.replace(/\s*<meta name="twitter:image" [^>]*>\s*/g, "")
    content = content.replace(/\s*<meta property="og:image" [^>]*>\s*/g, "")
    content = content.replace(/\s*<meta name="twitter:site" [^>]*>\s*/g, "")

    // Replace author content with webcode.pp.ua
    content = content.replace(
      /<meta name="author" content="[^"]*"/g,
      '<meta name="author" content="webcode.pp.ua"'
    )

    // Replace "Lovable Generated" with "webcode.pp.ua"
    content = content.replace(/Lovable Generated/g, "webcode.pp.ua")
    content = content.replace(/Lovable/g, "webcode.pp.ua")

    // Remove all existing contact button code blocks
    content = content.replace(
      /<!-- Contact Developer Button and Popup -->[\s\S]*?<\/script>/g,
      ""
    )
    console.log("Removed all existing contact button code")

    // Update the contactButtonCode variable with a system font stack
    const contactButtonCode = `
<!-- Contact Developer Button and Popup -->
<style>
  #contact-dev-btn {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    color: black;
    border: 1px solid #b7b7b7;
    box-sizing: border-box;
    border-radius: 6px;
    padding: 0 24px;
    height: 44px;
    line-height: 44px; /* Match the height for perfect centering */
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont,  Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #contact-dev-btn:hover {
    background-color: #f9f9f9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
    border-color: #d0d0d0;
  }
  
  #contact-dev-popup {
    display: none;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    width: 320px;
    max-width: 90vw;
    border: 1px solid #b7b7b7;
    animation: popup-slide-up 0.2s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  @keyframes popup-slide-up {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  
  #contact-dev-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  #contact-dev-popup-title {
    font-size: 18px;
    font-weight: 600;
    color: #111;
    margin: 0;
  }
  
  #contact-dev-popup a {
    display: flex;
    align-items: center;
    margin: 16px 0;
    color: #333;
    text-decoration: none;
    font-size: 16px;
    padding: 10px 12px;
    border-radius: 8px;
    transition: background-color 0.2s;
    border: 1px solid transparent;
  }
  
  #contact-dev-popup a:hover {
    background-color: #f5f5f5;
    border-color: #eaeaea;
  }
  
  #contact-dev-popup a svg {
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  #close-dev-popup {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: #f1f1f1;
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid #e5e5e5;
  }

  #close-dev-popup:hover {
    background-color: #e5e5e5;
  }
  
  #close-dev-popup svg {
    width: 18px;
    height: 18px;
    color: #666;
  }
  
  @media (max-width: 767px) {
    #contact-dev-btn {
      height: 46px;
      line-height: 46px;
      font-size: 16px;
      border-radius: 8px;
      bottom: 24px;
      width: 200px;
      border-width: 1px;
    }
    
    #contact-dev-popup {
      bottom: 24px;
      width: 280px;
      border-width: 1px;
    }
    
    #close-dev-popup {
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }
    
    #close-dev-popup svg {
      width: 22px;
      height: 22px;
    }
  }
</style>

<button id="contact-dev-btn" type="button">Contact Developer</button>

<div id="contact-dev-popup">
  <div id="contact-dev-popup-header">
    <h3 id="contact-dev-popup-title">Contact Us</h3>
    <div id="close-dev-popup">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
  </div>
  <a href="mailto:1580509@gmail.com">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 5-10-5" />
    </svg>
    1580509@gmail.com
  </a>
  <a href="https://t.me/srgrzn" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0088cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 4.5L2.5 12.5L9.5 13.5L11.5 19.5L16.5 12.5L21.5 4.5Z" />
    </svg>
    @srgrzn
  </a>
</div>

<script>
  // Add debugging logs
  console.log("Contact button script loaded");
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    const contactBtn = document.getElementById('contact-dev-btn');
    const contactPopup = document.getElementById('contact-dev-popup');
    const closePopup = document.getElementById('close-dev-popup');
    
    console.log("Button element found:", !!contactBtn);
    console.log("Popup element found:", !!contactPopup);
    console.log("Close button found:", !!closePopup);
    
    if (contactBtn && contactPopup && closePopup) {
      contactBtn.addEventListener('click', function(e) {
        console.log("Contact button clicked");
        e.stopPropagation();
        if (contactPopup.style.display === 'block') {
          contactPopup.style.display = 'none';
          contactBtn.style.display = 'block';
        } else {
          contactPopup.style.display = 'block';
          contactBtn.style.display = 'none'; // Hide button when popup is shown
        }
      });
      
      closePopup.addEventListener('click', function(e) {
        console.log("Close button clicked");
        e.stopPropagation();
        contactPopup.style.display = 'none';
        contactBtn.style.display = 'block'; // Show button again when popup is closed
      });
      
      // Close popup when clicking outside
      document.addEventListener('click', function(event) {
        if (contactPopup.style.display === 'block' && 
            !contactPopup.contains(event.target) && 
            event.target !== contactBtn) {
          console.log("Outside click detected, closing popup");
          contactPopup.style.display = 'none';
          contactBtn.style.display = 'block'; // Show button again
        }
      });
    } else {
      console.error("One or more required elements not found");
    }
  });
</script>`
    // Insert the new contact button code before the closing body tag
    content = content.replace("</body>", `${contactButtonCode}\n  </body>`)

    fs.writeFileSync(indexPath, content)
    console.log("✅ Updated index.html and added contact button")
  } else {
    console.log("❌ index.html not found")
  }
}

// 5. Update favicon
function updateFavicon() {
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m32 16l-4 16l-4-16l-4 16l-4-16" stroke-width="1"/></svg>`

  // Update favicon in index.html
  const indexPath = path.join(projectRoot, "index.html")

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, "utf8")

    // Look for existing favicon link
    const faviconRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi

    if (faviconRegex.test(content)) {
      // Replace existing favicon link
      content = content.replace(
        faviconRegex,
        `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${Buffer.from(
          faviconSvg
        ).toString("base64")}">`
      )
    } else {
      // Add new favicon link in the head section
      content = content.replace(
        "</head>",
        `  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${Buffer.from(
          faviconSvg
        ).toString("base64")}">\n  </head>`
      )
    }

    fs.writeFileSync(indexPath, content)
    console.log("✅ Updated favicon to SVG")
  } else {
    console.log("❌ index.html not found for favicon update")
  }

  // Also replace the actual favicon.ico file if it exists
  const faviconPath = path.join(projectRoot, "public", "favicon.ico")
  if (fs.existsSync(faviconPath)) {
    // Create SVG file to replace favicon
    const svgPath = path.join(projectRoot, "public", "favicon.svg")
    fs.writeFileSync(svgPath, faviconSvg)
    console.log("✅ Created favicon.svg in public folder")

    // Remove old favicon.ico
    fs.unlinkSync(faviconPath)
    console.log("✅ Removed old favicon.ico")
  }
}

// Execute all functions
console.log("Starting project cleanup...")
updateViteConfig()
deleteReadme()
removePackage()
updateIndexHtml()
updateFavicon() // Add this line to call the new function
console.log("Project cleanup completed!")