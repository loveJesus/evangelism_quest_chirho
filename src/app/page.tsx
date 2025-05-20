// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)

// This root page.tsx is hit before middleware redirects to a [lang] segment.
// The actual landing page content is rendered by src/app/[lang]/page.tsx.
// This file can return null or a minimal loading/redirect indicator.
export default function RootPage() {
  return null; 
}
