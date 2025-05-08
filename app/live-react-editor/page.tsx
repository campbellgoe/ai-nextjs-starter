"use client";
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import {
  useView,
  Compiler,
  Editor,
  Error,
  ActionButtons
} from 'react-view';
export const maxDuration = 22;
export default function LiveReactEditor() {
  const code = `import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";

<LiveProvider code="react code goes here">
  <div className="grid grid-cols-2 gap-4">
    <LiveEditor className="font-mono" />
    <LivePreview />
    <LiveError className="text-red-800 bg-red-100 mt-2" />
  </div>
</LiveProvider>`
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Live React Editor</h1>
      <p className="text-lg mb-8">
        Paste your code below to get instant feedback on run-time syntax errors etc.
      </p>
      <div className="flex justify-between flex-col">
        <LiveProvider code={code}>
          <div className="grid grid-cols-2 gap-4">
            <LiveEditor className="font-mono" />
            <LivePreview />
            <LiveError className="text-red-800 bg-red-100 mt-2" />
          </div>
        </LiveProvider>
        <LiveJavaScriptReactView />
      </div>
     
    </div>
  )
}



export const LiveJavaScriptReactView = () => {
  const params = useView({
    initialCode: '<Button>Hello</Button>',
    scope: {Button: ({children}) => <button>{children}</button>},
    onUpdate: console.log
  });

  return (
    <>
      <Compiler {...params.compilerProps} />
      <Editor {...params.editorProps} />
      <Error {...params.errorProps} />
      <ActionButtons {...params.actions} />
    </>
  );
}