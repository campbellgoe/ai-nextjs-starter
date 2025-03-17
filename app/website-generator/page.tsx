import { WebsiteBuilder } from '@/components/website-builder'
import React from 'react'

function WebsiteGeneratorPage() {
  return <div className="container mx-auto px-4 py-8">
  <h1 className="text-4xl font-bold text-center mb-8">AI Website Generator</h1>
  <p className="text-center text-muted-foreground mb-2">
   Tell the AI what you want for your single HTML+Tailwind page and get inspired by the AIs design.
  </p>
  <WebsiteBuilder />
</div>
}

export default WebsiteGeneratorPage