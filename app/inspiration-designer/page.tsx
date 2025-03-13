import { WebsiteBuilder } from '@/components/website-builder'
import React from 'react'

function WebsiteGeneratorPage() {
  return <div className="container mx-auto px-4 py-8">
  <h1 className="text-4xl font-bold text-center mb-8">AI Website Builder</h1>
  <p className="text-center text-muted-foreground mb-8">
    Describe the website you want to build, and our AI will generate it for you.
  </p>
  <WebsiteBuilder />
</div>
}

export default WebsiteGeneratorPage