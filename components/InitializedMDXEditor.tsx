'use client'
// @ts-ignore
import { highlight as prismaHighlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
// InitializedMDXEditor.tsx
// import type { ForwardedRef } from 'react'
import {
  linkPlugin,
  linkDialogPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  // InsertImage,
  // UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin,
  // type MDXEditorMethods,
  type MDXEditorProps,
  // type SandpackConfig,
  codeBlockPlugin,
  // sandpackPlugin,
  // codeMirrorPlugin,
  // ConditionalContents,
  // ChangeCodeMirrorLanguage,
  // ShowSandpackInfo,
  // InsertSandpack,
  // InsertCodeBlock,
  imagePlugin,
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
  // CreateLink,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import Editor from 'react-simple-code-editor'

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  // always use the editor, no matter the language or the meta of the code block
  match: (language, meta) => true,
  // You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
  priority: 0,
  // The Editor is a React component
  Editor: (props) => {
    const cb = useCodeBlockEditorContext()
   // stops the proppagation so that the parent lexical editor does not handle certain events.
    return (
      <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <Editor
            value={props.code}
            onValueChange={(code: string) => cb.setCode(code)}
            highlight={(code: string) => code ? prismaHighlight(code, !!props.language && props.language in languages ? languages[props.language] : languages.js) : null}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
            }}
          />
      </div>
    )
  }
}

// Only import this to the next file
export default function InitializedMDXEditor(
  props
: MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        linkPlugin(),
        linkDialogPlugin(),
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        imagePlugin(),
        codeBlockPlugin({ codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor] }),
        // codeMirrorPlugin({ codeBlockLanguages: {
        //   "javascript": "JavaScript",
        //   "typescript": "TypeScript",
        //   "html": "HTML",
        //   "css": "CSS",
        //   "python": "Python",
        //   "json": "JSON",
        //   "yaml": "YAML",
        //   "bash": "Bash",
        //   "markdown": "Markdown",
        //   "regex": "Regex",
        //   "graphql": "GraphQL",
        //   "rust": "Rust",
        //   "java": "Java",
        //   "sql": "SQL",
        //   "c": "C",
        //   "cpp": "C++",
        //   "jsx": "React JSX",
        //   "tsx": "React TSX",
        //   "csharp": "C#",
        //   "php": "PHP",
        //   "go": "Go",
        //   "swift": "Swift",
        //   "kotlin": "Kotlin",
        //   "ruby": "Ruby",
        //   "dart": "Dart",
        //   "lua": "Lua",
        //   "haskell": "Haskell",
        //   "r": "R",
        //   "matlab": "MATLAB",
        //   "assembly": "Assembly"
        // }
        //  }),
        // toolbarPlugin({
        //   toolbarClassName: 'mdx-editor-toolbar',
        //   toolbarContents: () => (
        //     <>
        //       {' '}
        //       <UndoRedo />
        //       <BoldItalicUnderlineToggles />
        //       <CreateLink />
        //       <InsertImage />
        //       <ConditionalContents
        //         options={[
        //           { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
        //           { when: (editor) => editor?.editorType === 'sandpack', contents: () => <ShowSandpackInfo /> },
        //           { fallback: () => ( <> 
        //           <InsertCodeBlock />
        //           <InsertSandpack />
        //         </>) }
        //         ]}
        //       />
        //     </>
        //   )
        // })
      ]}
      {...props}
    />
  )
}