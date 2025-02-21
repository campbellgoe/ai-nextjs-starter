'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/PersistentAppContext";

import { useParams } from 'next/navigation'
import { useRef, useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/contexts/PersistentAppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NavBarMain from '@/components/NavBarMain'
import dynamic from 'next/dynamic'
import { forwardRef } from "react"

import { Switch } from '@/components/ui/switch'
import {
  type MDXEditorMethods,
  type MDXEditorProps
} from '@mdxeditor/editor'
// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import('@/components/InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false
})

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
// @ts-ignore
const MyMDXEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => <Editor {...props} editorRef={ref} />)

// TS complains without the following line
MyMDXEditor.displayName = 'MyMDXEditor'

export default function Chat() {

  const { logoTextValue } = useAppContext()

  const params = useParams<{ slug: string }>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const router = useRouter()
  const { user } = useAppContext()
  const { slug } = params
  useEffect(() => {
    // Fetch the course data when the component mounts
    const fetchCourse = async () => {
      const response = await fetch(`/api/course/${slug}`)
      if (response.ok) {
        const course = await response.json()
        setTitle(course.title)
        setDescription(course.description)
        setCategory(course.category)
        setContent(course.content)
        setAuthorId(course.teacherId)
        setIsPublished(course.isPublished || false)
      } else {
        console.error('Failed to fetch course')
        // error
      }
    }
    fetchCourse()
  }, [slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const courseData = {
      title,
      description,
      category,
      content,
      teacherId: authorId,
      authorName: user?.name || 'Unknown',
      isPublished
    }

    const response = await fetch(`/api/course/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    })

    if (response.ok) {
      router.push('/app/dashboard')
    } else {
      alert('Failed to update course')
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      const response = await fetch(`/api/course/${slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/app/dashboard')
      } else {
        alert('Failed to delete course')
      }
    }
  }
  const mdxEditorRef = useRef<MDXEditorMethods>(null)

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to {logoTextValue}</CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="w-full max-w-2xl mx-auto">
            {/* <CardHeader>
              <CardTitle>Conversation about {messages[0].content}</CardTitle>
            </CardHeader> */}
            <CardContent>
              {(typeof content == "string") && <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <Input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Course Content (MDX)
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    required
                    onChange={(e: any) => {
                      setContent(e.target.value)
                      mdxEditorRef.current?.setMarkdown(e.target.value)
                    }}
                    rows={10}
                  />
                  <Suspense fallback={null}>
                    <MyMDXEditor
                      ref={mdxEditorRef}
                      markdown={content}
                      onChange={(e: string) => setContent(e)}
                      contentEditableClassName="my-mdx-editor"
                    />
                  </Suspense>
                </div>
                <div>
                  <label htmlFor="is-published" className="block text-sm font-medium tex-gray-700">
                    Publish it?
                  </label>
                  <Switch checked={isPublished} onCheckedChange={(checked: boolean) => {
                    setIsPublished(checked)
                  }} />
                </div>
                <Button type="submit">Update Course</Button>
                <Button type="button" onClick={handleDelete} className="ml-4 bg-red-600 hover:bg-red-700">
                  Delete Course
                </Button>
              </form>}
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="">

        </CardFooter>
      </Card>
    </div>
  );
}

