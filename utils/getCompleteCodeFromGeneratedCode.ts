export const getHtmlContent = (framework: "html", code: string) => {
  if (framework === "html") {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Website Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    ${code.trim().split("```").join("").replace("html", "")}
  </body>
</html>
    `
  } else if (framework === "react") {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width-device-width, initial-scale=1">
          <title>React Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
            
            // Add rendering if not included in the code
            if (typeof App !== 'undefined' && !code.includes('ReactDOM.render') && !code.includes('createRoot')) {
              ReactDOM.createRoot(document.getElementById('root')).render(<App />);
            }
          </script>
        </body>
      </html>
    `
  } else if (framework === "nextjs") {
    // For Next.js, we'll use a simplified React preview with a note
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Next.js Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <div style="position: absolute; top: 10px; left: 10px; background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px; z-index: 1000;">
            ⚠️ Next.js preview is simplified (client-side only)
          </div>
          <script type="text/babel">
            // Mock Next.js components and hooks
            const Link = ({ href, children, ...props }) => (
              <a href={href} {...props}>{children}</a>
            );
            
            const Image = ({ src, alt, width, height, ...props }) => (
              <img 
                src={src || '/placeholder.svg?height=300&width=300'} 
                alt={alt || ''} 
                width={width} 
                height={height}
                {...props}
              />
            );
            
            const useRouter = () => ({
              push: (path) => console.log('Navigate to:', path),
              pathname: '/current-path'
            });
            
            ${code}
            
            // Add rendering if not included in the code
            if (typeof Page !== 'undefined' || typeof Home !== 'undefined' || typeof App !== 'undefined') {
              const ComponentToRender = Page || Home || App;
              ReactDOM.createRoot(document.getElementById('root')).render(<ComponentToRender />);
            }
          </script>
        </body>
      </html>
    `
  }

  return "<html><body>Unsupported framework</body></html>"
}